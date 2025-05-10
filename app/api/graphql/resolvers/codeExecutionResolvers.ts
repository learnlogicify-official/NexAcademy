import { GraphQLError } from 'graphql';
import { runWithJudge0, Judge0TestCase, Judge0Result } from '@/utils/judge0';
import { prisma } from '@/lib/prisma';
import { createPubSub } from '@graphql-yoga/subscription';
import { generateUUID } from '@/utils/helpers';

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
  // Determine if the test case was skipped
  const isSkipped = judge0Result.status.description === "Skipped" || 
                    judge0Result.verdict === "Skipped";
  
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
    isSkipped,
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
        if (context.session?.user?.id) {
          try {
            // Count skipped testcases
            const skippedTestcases = formattedResults.filter(result => 
              result.isSkipped || 
              result.verdict === "Skipped" || 
              result.status?.description === "Skipped"
            ).length;

            // Count passed testcases correctly
            const passedTestcases = formattedResults.filter(result => result.isCorrect).length;
            
            // Use type assertion to bypass type checking until Prisma client types are updated
            await prisma.problemSubmission.create({
              data: {
                userId: context.session.user.id,
                problemId: problemId,
                language: languageId.toString(),
                code: sourceCode,
                submittedAt: new Date(),
                testcasesPassed: passedTestcases,
                skippedTestcases, // Include skippedTestcases from the schema
                totalTestcases: judge0TestCases.length,
                allPassed: allTestsPassed,
                runtime: formattedResults[0]?.executionTime || null,
                memory: formattedResults[0]?.memoryUsed ? formattedResults[0].memoryUsed.toString() : null
              } as any // Use type assertion to bypass type checking
            });
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
          executionId
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