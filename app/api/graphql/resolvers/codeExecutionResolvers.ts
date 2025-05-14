import { GraphQLError } from 'graphql';
import { runWithJudge0, Judge0TestCase, Judge0Result } from '@/utils/judge0';
import { prisma } from '@/lib/prisma';
import { createPubSub } from '@graphql-yoga/subscription';
import { generateUUID } from '@/utils/helpers';
import { awardXP, XP_REWARDS } from '@/lib/xp-service';
import { recordActivity } from '@/lib/streak-service';
import { getUserTimezoneOffset } from '@/utils/streak-helpers';

// Create a pubsub instance for GraphQL subscriptions
const pubsub = createPubSub();

// Publication topics
const EXECUTION_PROGRESS = 'EXECUTION_PROGRESS';

// Type for context passed from Apollo Server
interface Context {
  session?: any;
  req: Request;
}

// Convert Judge0Result to TestCaseResult format expected by schema
const formatTestCaseResult = (judge0Result: Judge0Result, testCaseId?: string) => {
  return {
    id: testCaseId || 'unknown',
    input: judge0Result.input,
    expectedOutput: judge0Result.expected,
    actualOutput: judge0Result.output,
    stderr: judge0Result.stderr,
    compileOutput: judge0Result.compile_output,
    status: {
      id: judge0Result.status.id,
      description: judge0Result.status.description
    },
    verdict: judge0Result.verdict,
    isCorrect: judge0Result.verdict === 'Accepted',
    executionTime: judge0Result.time,
    memoryUsed: judge0Result.memory
  };
};

export const codeExecutionResolvers = {
  Query: {
    codeExecutionInfo: () => "Code execution API is operational"
  },
  
  Subscription: {
    executionProgress: {
      subscribe: (_: any, { executionId }: { executionId: string }) => {
        const topic = `${EXECUTION_PROGRESS}_${executionId}`;
        return pubsub.subscribe(topic);
      }
    }
  },
  
  Mutation: {
    // Run code against sample test cases only
    runCode: async (_: any, { input }: { input: { sourceCode: string; languageId: number; problemId: string; executionId?: string } }, context: Context) => {
      try {
        const { sourceCode, languageId, problemId, executionId = generateUUID() } = input;
        
        // Fetch sample test cases for this problem
        const codingQuestion = await prisma.codingQuestion.findUnique({
          where: { questionId: problemId },
          include: {
            testCases: {
              where: { isSample: true },
              orderBy: { id: 'asc' }
            }
          }
        });
        
        if (!codingQuestion) {
          throw new GraphQLError(`Problem with ID ${problemId} not found`);
        }
        
        // Map test cases to Judge0 format
        const judge0TestCases: Judge0TestCase[] = codingQuestion.testCases.map(tc => ({
          input: tc.input,
          expectedOutput: tc.output
        }));
        
        if (judge0TestCases.length === 0) {
          return {
            success: false,
            message: "No sample test cases available for this problem",
            results: [],
            allTestsPassed: false,
            totalTests: 0
          };
        }
        
        // Progress callback for real-time updates
        const progressCallback = (results: Judge0Result[], completedCount: number) => {
          // Format current results
          const formattedResults = results.map((result, index) => 
            formatTestCaseResult(result, codingQuestion.testCases[index]?.id)
          );
          
          // Publish progress update
          pubsub.publish(`${EXECUTION_PROGRESS}_${executionId}`, {
            executionProgress: {
              executionId,
              completedTests: completedCount,
              totalTests: judge0TestCases.length,
              results: formattedResults,
              message: `Completed ${completedCount} of ${judge0TestCases.length} tests`
            }
          });
        };
        
        // Execute code against sample test cases
        const executionResults = await runWithJudge0({
          sourceCode,
          languageId,
          testCases: judge0TestCases,
          progressCallback
        });
        
        // Format results to match GraphQL schema
        const formattedResults = executionResults.map((result, index) => 
          formatTestCaseResult(result, codingQuestion.testCases[index]?.id)
        );
        
        // Check if all tests passed
        const allTestsPassed = formattedResults.every(result => result.isCorrect);
        
        return {
          success: true,
          message: allTestsPassed ? "All sample tests passed!" : "Some tests failed",
          results: formattedResults,
          allTestsPassed,
          totalTests: judge0TestCases.length,
          executionId
        };
      } catch (error: any) {
        console.error("Error executing runCode:", error);
        return {
          success: false,
          message: `Execution error: ${error.message}`,
          results: [],
          allTestsPassed: false,
          totalTests: 0
        };
      }
    },
    
    // Submit code to run against all test cases (including hidden ones)
    submitCode: async (_: any, { input }: { 
      input: { 
        sourceCode: string; 
        languageId: number; 
        problemId: string; 
        executeInParallel?: boolean; 
        executionId?: string;
        timezoneOffset?: number;
        judge0Settings?: {
          cpu_time_limit?: number;
          cpu_extra_time?: number;
          wall_time_limit?: number;
          memory_limit?: number;
          stack_limit?: number;
          compilation_time_limit?: number;
          max_file_size?: number;
          max_processes_and_or_threads?: number;
        }
      } 
    }, context: Context) => {
      try {
        const { 
          sourceCode, 
          languageId, 
          problemId, 
          executeInParallel = false, 
          executionId = generateUUID(),
          timezoneOffset,
          judge0Settings
        } = input;
        
        // Fetch all test cases for this problem
        const codingQuestion = await prisma.codingQuestion.findUnique({
          where: { questionId: problemId },
          include: {
            testCases: {
              orderBy: { id: 'asc' }
            }
          }
        });
        
        if (!codingQuestion) {
          throw new GraphQLError(`Problem with ID ${problemId} not found`);
        }
        
        // Map test cases to Judge0 format
        const judge0TestCases: Judge0TestCase[] = codingQuestion.testCases.map(tc => ({
          input: tc.input,
          expectedOutput: tc.output
        }));
        
        if (judge0TestCases.length === 0) {
          return {
            success: false,
            message: "No test cases available for this problem",
            results: [],
            allTestsPassed: false,
            totalTests: 0
          };
        }

        let executionResults: Judge0Result[] = [];
        let failedTestIndex = -1;
        
        // Progress callback for real-time updates
        const progressCallback = (results: Judge0Result[], completedCount: number) => {
          // Format current results
          const formattedResults = results.map((result, index) => 
            formatTestCaseResult(result, codingQuestion.testCases[index]?.id)
          );
          
          // Publish progress update
          pubsub.publish(`${EXECUTION_PROGRESS}_${executionId}`, {
            executionProgress: {
              executionId,
              completedTests: completedCount,
              totalTests: judge0TestCases.length,
              results: formattedResults,
              message: `Completed ${completedCount} of ${judge0TestCases.length} tests`
            }
          });
        };
        
        // Execute the code with the hybrid approach
        executionResults = await runWithJudge0({
          sourceCode,
          languageId,
          testCases: judge0TestCases,
          progressCallback,
          forceBatch: executeInParallel,
          forceSequential: !executeInParallel,
          executionSettings: judge0Settings // Pass custom settings to Judge0
        });
        
        // Find the first failing test case index
        failedTestIndex = executionResults.findIndex(result => result.verdict !== 'Accepted');
        
        // Format results to match GraphQL schema
        const formattedResults = executionResults.map((result, index) => 
          formatTestCaseResult(result, codingQuestion.testCases[index]?.id)
        );
        
        // If we ran all test cases, all tests have passed
        const allTestsPassed = failedTestIndex === -1;
        
        // Store the submission if user is logged in
        let submissionId = null;
        let xpInfo = null;
        let streakInfo = null;
        let isFirstCorrectSubmission = false;

        if (context.session?.user?.id) {
          try {
            // Determine the overall status for the submission
            let status = "PENDING";
            if (allTestsPassed) {
              status = "ACCEPTED";
            } else if (failedTestIndex !== -1) {
              // Get the verdict from the first failed test case
              const failedVerdict = executionResults[failedTestIndex]?.verdict || "";
              
              if (failedVerdict === "Time Limit Exceeded" || (executionResults[failedTestIndex]?.status?.id === 5)) {
                status = "TIME_LIMIT_EXCEEDED";
              } else if (failedVerdict === "Compilation Error" || executionResults[failedTestIndex]?.compile_output) {
                status = "COMPILATION_ERROR";
              } else if (failedVerdict === "Runtime Error" || executionResults[failedTestIndex]?.stderr) {
                status = "RUNTIME_ERROR";
              } else if (failedVerdict === "Memory Limit Exceeded") {
                status = "MEMORY_LIMIT_EXCEEDED";
              } else {
                status = "WRONG_ANSWER";
              }
            }
            
            const submission = await prisma.problemSubmission.create({
              data: {
                userId: context.session.user.id,
                problemId: problemId,
                language: languageId.toString(),
                code: sourceCode,
                submittedAt: new Date(),
                testcasesPassed: allTestsPassed ? judge0TestCases.length : (failedTestIndex === -1 ? judge0TestCases.length : failedTestIndex),
                totalTestcases: judge0TestCases.length,
                allPassed: allTestsPassed,
                runtime: formattedResults[0]?.executionTime || null,
                memory: formattedResults[0]?.memoryUsed ? formattedResults[0].memoryUsed.toString() : null,
                status: status
              }
            });
            
            submissionId = submission.id;
            
            // Award XP if solution is correct
            if (allTestsPassed) {
              try {
                // Get problem difficulty to determine XP amount
                const codingQuestion = await prisma.codingQuestion.findFirst({
                  where: { 
                    questionId: problemId
                  },
                  select: { 
                    difficulty: true 
                  }
                });
                
                // Determine XP amount based on difficulty
                let xpAmount = XP_REWARDS.CORRECT_SUBMISSION; // Default for EASY
                if (codingQuestion?.difficulty === "MEDIUM") {
                  xpAmount = XP_REWARDS.MEDIUM_DIFFICULTY;
                } else if (codingQuestion?.difficulty === "HARD") {
                  xpAmount = XP_REWARDS.HARD_DIFFICULTY;
                }
                
                // Award XP for solving the problem
                const xpResult = await awardXP(
                  context.session.user.id,
                  problemId,
                  'correct_submission',
                  xpAmount,
                  `Solved problem correctly`
                );
                
                let totalXPAwarded = xpResult?.isNewAward ? xpAmount : 0;
                let newLevel = xpResult?.newLevel;
                
                // If this is their first correct submission, award additional XP
                if (xpResult?.isNewAward) {
                  // Check if this is their first ever correct submission
                  const submissionCount = await prisma.problemSubmission.count({
                    where: {
                      userId: context.session.user.id,
                      allPassed: true
                    }
                  });
                  
                  isFirstCorrectSubmission = submissionCount === 1;
                  
                  if (isFirstCorrectSubmission) {
                    const firstSubmissionResult = await awardXP(
                      context.session.user.id,
                      null,
                      'first_submission',
                      XP_REWARDS.FIRST_SUBMISSION,
                      'First correct solution'
                    );
                    
                    totalXPAwarded += XP_REWARDS.FIRST_SUBMISSION;
                    newLevel = firstSubmissionResult?.newLevel || newLevel;
                  }
                }
                
                // Use provided timezone offset or get a default value
                // This ensures accurate streak calculation based on user's timezone
                const userTimezoneOffset = timezoneOffset ?? getUserTimezoneOffset();
                
                // Record streak activity when user solves a problem correctly
                try {
                  console.log('Recording streak activity for user:', context.session.user.id, 'with timezone offset:', userTimezoneOffset);
                  const streakResult = await recordActivity(
                    context.session.user.id,
                    'submission',
                    0, // Don't add additional XP here since it's already awarded above
                    userTimezoneOffset // Pass timezone offset for accurate date calculation
                  );
                  
                  console.log('Streak activity result:', streakResult);
                  streakInfo = streakResult;
                  
                  // IMPORTANT: Log when a streak is established or maintained
                  if (streakResult.streakUpdated || streakResult.streakMaintained) {
                    console.log('⭐️ STREAK ESTABLISHED/MAINTAINED ⭐️', {
                      userId: context.session.user.id,
                      currentStreak: streakResult.currentStreak,
                      streakUpdated: streakResult.streakUpdated,
                      streakMaintained: streakResult.streakMaintained,
                      longestStreak: streakResult.longestStreak || streakResult.currentStreak,
                      timezoneOffset: userTimezoneOffset
                    });
                  } else {
                    console.log('No streak established or maintained');
                  }
                  
                  // If this is the first submission that updated the streak today
                  if (streakResult.streakUpdated && !streakResult.streakMaintained) {
                    console.log('Streak updated - awarding additional XP');
                    totalXPAwarded += XP_REWARDS.STREAK_DAY;
                  }
                  
                  // Set XP info for response
                  xpInfo = {
                    awarded: xpResult?.isNewAward || false,
                    amount: totalXPAwarded,
                    newTotal: xpResult?.userXP?.xp || 0,
                    levelUp: !!newLevel,
                    newLevel: newLevel || null,
                    streakInfo: streakResult
                  };
                  
                  console.log('Final XP info with streak:', xpInfo);
                } catch (streakError) {
                  console.error("Error updating streak:", streakError);
                  // Continue even if streak update fails
                  
                  // Set XP info without streak information
                  xpInfo = {
                    awarded: xpResult?.isNewAward || false,
                    amount: totalXPAwarded,
                    newTotal: xpResult?.userXP?.xp || 0,
                    levelUp: !!newLevel,
                    newLevel: newLevel || null
                  };
                }
              } catch (xpError) {
                console.error("Error awarding XP:", xpError);
                // Continue even if XP award fails
              }
            }
          } catch (err) {
            console.error("Failed to store submission:", err);
            // Continue even if storage fails
          }
        }
        
        return {
          success: true,
          message: allTestsPassed 
            ? "All tests passed! Solution is correct." 
            : `Test case ${failedTestIndex + 1} failed.`,
          results: formattedResults,
          allTestsPassed,
          totalTests: judge0TestCases.length,
          executionId,
          submissionId,
          xp: xpInfo, // includes XP info
          // Show streak modal ONLY when streak is established/updated NOT when just maintained
          streakEstablished: streakInfo ? streakInfo.streakUpdated : false,
          currentStreak: streakInfo?.currentStreak || 0,
          highestStreak: streakInfo?.longestStreak || 0
        };
      } catch (error: any) {
        console.error("Error executing submitCode:", error);
        return {
          success: false,
          message: `Submission error: ${error.message}`,
          results: [],
          allTestsPassed: false,
          totalTests: 0
        };
      }
    }
  }
}; 