import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Configure revalidation options
export const revalidate = 3600; // 1 hour

// Define types for raw query results
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

/**
 * GET /api/problem/[id]/statistics
 * Returns statistics for a specific problem
 */
export async function GET(request: Request, context: Promise<{ params: { id: string } }>) {
  try {
    // Await the context to get params
    const { params } = await context;
    const problemId = params.id;
    
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
    
    return NextResponse.json({
      ...stats,
      acceptanceRate
    });
  } catch (error) {
    console.error('Error fetching problem statistics:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 