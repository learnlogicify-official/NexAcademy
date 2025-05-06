import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Cache the response for 1 hour
export const revalidate = 3600;

/**
 * GET /api/problem/[id]/bundle
 * Consolidates multiple API requests into a single endpoint
 * for improved performance and reduced network overhead
 */
export async function GET(request: Request, context: Promise<{ params: { id: string } }>) {
  try {
    const { params } = await context;
    const problemId = params.id;
    
    // Get user session for authenticated requests
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Extract query parameters
    const url = new URL(request.url);
    const lastLanguageFromQuery = url.searchParams.get('lastLanguage');
    
    console.log(`[DEBUG] Bundle API called for problem ${problemId}`);
    console.log(`[DEBUG] User logged in: ${!!userId}, userId: ${userId || 'none'}`);
    console.log(`[DEBUG] Last language from query: ${lastLanguageFromQuery || 'none'}`);
    
    // Parallel data fetching for all resources
    const [problemData, judge0Languages, statistics, similarProblems, lastLanguageSetting] = await Promise.all([
      fetchProblemData(problemId),
      fetchJudge0Languages(),
      fetchProblemStatistics(problemId),
      fetchSimilarProblems(problemId),
      fetchLastLanguage(problemId, userId)
    ]);
    
    // Handle not found
    if (!problemData) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    
    console.log(`[DEBUG] Last language from DB: ${lastLanguageSetting || 'none'}`);
    
    // Determine which language to preload (based on name or ID)
    let lastLanguageToUse: string | null = null;
    
    // First priority: the language from query params if it matches an available language
    if (lastLanguageFromQuery) {
      // Check if it's a full language name or an ID
      const matchByName = problemData.languageOptions.find(
        (option: any) => option.name === lastLanguageFromQuery
      );
      
      const matchById = problemData.languageOptions.find(
        (option: any) => String(option.languageId) === lastLanguageFromQuery
      );
      
      if (matchByName) {
        console.log(`[DEBUG] Found matching language by name: ${matchByName.name}`);
        lastLanguageToUse = matchByName.name;
      } else if (matchById) {
        console.log(`[DEBUG] Found matching language by ID: ${matchById.name}`);
        lastLanguageToUse = matchById.name; // Use the name, not the ID
      }
    }
    
    // Second priority: the language from DB settings if it matches an available language
    if (!lastLanguageToUse && lastLanguageSetting) {
      // Check if it's a full language name or an ID
      const matchByName = problemData.languageOptions.find(
        (option: any) => option.name === lastLanguageSetting
      );
      
      const matchById = problemData.languageOptions.find(
        (option: any) => String(option.languageId) === lastLanguageSetting
      );
      
      if (matchByName) {
        console.log(`[DEBUG] Found matching language from settings by name: ${matchByName.name}`);
        lastLanguageToUse = matchByName.name;
      } else if (matchById) {
        console.log(`[DEBUG] Found matching language from settings by ID: ${matchById.name}`);
        lastLanguageToUse = matchById.name; // Use the name, not the ID
      }
    }
    
    // Third priority: first available language
    if (!lastLanguageToUse && problemData.languageOptions.length > 0) {
      console.log(`[DEBUG] Using first available language: ${problemData.languageOptions[0].name}`);
      lastLanguageToUse = problemData.languageOptions[0].name;
    }
    
    console.log(`[DEBUG] Final selected language: ${lastLanguageToUse || 'none'}`);
    
    // Bundle all data together
    return NextResponse.json({
      problem: problemData,
      judge0Languages: judge0Languages?.languages || [],
      statistics,
      similarProblems,
      lastLanguage: lastLanguageToUse
    });
  } catch (error) {
    console.error('Error fetching bundled data:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * Fetch the user's last selected language for this problem
 */
async function fetchLastLanguage(problemId: string, userId: string | undefined) {
  if (!userId) {
    console.log(`[DEBUG] No userId provided, skipping last language fetch`);
    return null;
  }
  
  try {
    console.log(`[DEBUG] Fetching last language for user ${userId}, problem ${problemId}`);
    
    // Look up the user's preference in UserProblemSettings
    const setting = await prisma.userProblemSettings.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId
        }
      },
      select: {
        lastLanguage: true
      }
    });
    
    console.log(`[DEBUG] User setting found: ${!!setting}, last language: ${setting?.lastLanguage || 'none'}`);
    
    return setting?.lastLanguage || null;
  } catch (error) {
    console.error('Error fetching last language setting:', error);
    return null;
  }
}

/**
 * Fetch problem data
 */
async function fetchProblemData(problemId: string) {
  try {
    // Using raw query to avoid TypeScript errors with Prisma schema
    const questions = await prisma.$queryRaw`
      SELECT 
        q.id,
        q.title,
        cq.difficulty,
        cq."questionText" as description,
        cq."defaultCode" as "starterCode"
      FROM 
        "Question" q
      JOIN 
        "CodingQuestion" cq ON q.id = cq."questionId"
      WHERE 
        q.id = ${problemId}
      LIMIT 1
    `;
    
    // Convert to array
    const question = Array.isArray(questions) && questions.length > 0 ? questions[0] : null;
    
    if (!question) return null;

    // Get tags for this problem
    const tagsResult = await prisma.$queryRaw`
      SELECT 
        t.name
      FROM 
        "Tag" t
      JOIN 
        "_CodingQuestionToTag" cqt ON t.id = cqt."B"
      JOIN 
        "CodingQuestion" cq ON cqt."A" = cq.id
      JOIN 
        "Question" q ON cq."questionId" = q.id
      WHERE 
        q.id = ${problemId}
    `;
    
    const tags = Array.isArray(tagsResult) ? tagsResult.map((t: any) => t.name) : [];
    
    // Get sample test cases
    const testCases = await prisma.$queryRaw`
      SELECT 
        tc.id,
        tc.input,
        tc.output as "expectedOutput"
      FROM 
        "TestCase" tc
      JOIN 
        "CodingQuestion" cq ON tc."codingQuestionId" = cq.id
      JOIN 
        "Question" q ON cq."questionId" = q.id
      WHERE 
        q.id = ${problemId}
        AND tc."isSample" = true
    `;
    
    const sampleTestCases = Array.isArray(testCases) 
      ? testCases.map((tc: any) => ({
          id: tc.id,
          input: typeof tc.input === "string" ? tc.input : JSON.stringify(tc.input),
          expectedOutput: typeof tc.expectedOutput === "string" ? tc.expectedOutput : JSON.stringify(tc.expectedOutput),
          status: 'pending'
        }))
      : [];
    
    // Get language options
    const languageOptions = await prisma.$queryRaw`
      SELECT 
        lo.id,
        lo."languageId",
        lo.name,
        lo."preloadCode"
      FROM 
        "LanguageOption" lo
      JOIN 
        "CodingQuestion" cq ON lo."codingQuestionId" = cq.id
      JOIN 
        "Question" q ON cq."questionId" = q.id
      WHERE 
        q.id = ${problemId}
    `;
    
    console.log(`[DEBUG] Fetched ${Array.isArray(languageOptions) ? languageOptions.length : 0} language options for problem ${problemId}`);
    if (Array.isArray(languageOptions) && languageOptions.length > 0) {
      console.log(`[DEBUG] First language option: ID=${languageOptions[0].id}, languageId=${languageOptions[0].languageId}, name=${languageOptions[0].name}`);
    }
    
    return {
      id: question.id,
      title: question.title,
      difficulty: question.difficulty,
      description: question.description,
      tags,
      sampleTestCases,
      starterCode: question.starterCode || '',
      languageOptions: Array.isArray(languageOptions) ? languageOptions : []
    };
  } catch (error) {
    console.error('Error fetching problem data:', error);
    return null;
  }
}

/**
 * Fetch Judge0 languages
 */
async function fetchJudge0Languages() {
  try {
    // This should be the same API that /api/judge0/languages uses
    const response = await fetch(
      `${process.env.JUDGE0_API_URL || 'http://128.199.24.150:2358'}/languages`
    );

    if (!response.ok) return null;
    
    const languages = await response.json();
    console.log(`[DEBUG] Fetched ${languages?.length || 0} Judge0 languages`);
    return { languages };
  } catch (error) {
    console.error('Error fetching Judge0 languages:', error);
    return null;
  }
}

/**
 * Fetch problem statistics
 */
async function fetchProblemStatistics(problemId: string) {
  try {
    // Type definitions for raw query results
    type SubmissionStats = {
      totalSubmissions: string;
      acceptedSubmissions: string;
    };
    
    type SolvedByStats = {
      uniqueUsers: string;
    };
    
    type SolutionsStats = {
      totalSolutions: string;
    };
    
    // Get acceptance rate from successful vs total submissions
    const submissionStats = await prisma.$queryRaw<SubmissionStats[]>`
      SELECT 
        CAST(COUNT(*) AS INTEGER) as totalSubmissions,
        CAST(SUM(CASE WHEN "allPassed" = true THEN 1 ELSE 0 END) AS INTEGER) as acceptedSubmissions
      FROM "ProblemSubmission"
      WHERE "problemId" = ${problemId}
    `;
    
    // Get the count of unique users who have solved the problem
    const solvedBy = await prisma.$queryRaw<SolvedByStats[]>`
      SELECT COUNT(DISTINCT "userId") as uniqueUsers
      FROM "ProblemSubmission"
      WHERE "problemId" = ${problemId} AND "allPassed" = true
    `;
    
    // Get the count of solutions for this problem
    const solutionsCount = await prisma.$queryRaw<SolutionsStats[]>`
      SELECT COUNT(*) as totalSolutions
      FROM "ProblemSolution"
      WHERE "problemId" = ${problemId}
    `;
    
    // Format the data for response
    const stats = {
      totalSubmissions: 
        submissionStats[0]?.totalSubmissions ? Number(submissionStats[0].totalSubmissions) : 0,
      acceptedSubmissions: 
        submissionStats[0]?.acceptedSubmissions ? Number(submissionStats[0].acceptedSubmissions) : 0,
      uniqueUsersSolved: 
        solvedBy[0]?.uniqueUsers ? Number(solvedBy[0].uniqueUsers) : 0,
      totalSolutions: 
        solutionsCount[0]?.totalSolutions ? Number(solutionsCount[0].totalSolutions) : 0
    };
    
    // Calculate acceptance rate
    const acceptanceRate = stats.totalSubmissions > 0 
      ? Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100) 
      : 0;
    
    return { ...stats, acceptanceRate };
  } catch (error) {
    console.error('Error fetching problem statistics:', error);
    return null;
  }
}

/**
 * Fetch similar problems
 */
async function fetchSimilarProblems(problemId: string) {
  try {
    // Find 5 random problems to recommend
    const randomProblems = await prisma.$queryRaw`
      SELECT 
        q.id, 
        q.title,
        CASE 
          WHEN cq.difficulty = 'EASY' THEN 'Easy'
          WHEN cq.difficulty = 'MEDIUM' THEN 'Medium'
          WHEN cq.difficulty = 'HARD' THEN 'Hard'
          ELSE 'Unknown'
        END as difficulty
      FROM 
        "Question" q
      JOIN 
        "CodingQuestion" cq ON q.id = cq."questionId" 
      WHERE 
        q.id != ${problemId}
      ORDER BY 
        RANDOM()
      LIMIT 5
    `;
    
    return randomProblems || [];
  } catch (error) {
    console.error('Error fetching similar problems:', error);
    return [];
  }
} 