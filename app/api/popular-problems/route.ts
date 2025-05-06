import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Configure revalidation options to cache this response
export const revalidate = 86400; // 24 hours

/**
 * GET /api/popular-problems
 * Returns a list of the most popular problems for static generation
 */
export async function GET() {
  try {
    // Find the top 20 most viewed problems
    // This uses the raw query approach for better performance with aggregation
    const popularProblems = await prisma.$queryRaw`
      SELECT 
        q.id, 
        q.title, 
        COALESCE(ps.viewCount, 0) as viewCount
      FROM 
        "Question" q
      LEFT JOIN (
        SELECT 
          "problemId", 
          COUNT(*) as viewCount 
        FROM 
          "ProblemView" 
        GROUP BY 
          "problemId"
      ) ps ON q.id = ps."problemId"
      WHERE 
        q."codingQuestionId" IS NOT NULL
      ORDER BY 
        viewCount DESC, q.id ASC
      LIMIT 20
    `;

    // If the raw query doesn't work in your version of Prisma, use this alternative:
    // const popularProblems = await prisma.question.findMany({
    //   where: {
    //     codingQuestionId: { not: null }
    //   },
    //   select: {
    //     id: true,
    //     title: true
    //   },
    //   take: 20
    // });

    return NextResponse.json({
      problems: popularProblems,
    });
  } catch (error) {
    console.error('Error fetching popular problems:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 