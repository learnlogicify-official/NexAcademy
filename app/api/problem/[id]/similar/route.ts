import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Configure revalidation options
export const revalidate = 86400; // 24 hours

/**
 * GET /api/problem/[id]/similar
 * Returns similar problems to the specified problem
 */
export async function GET(request: Request, context: Promise<{ params: { id: string } }>) {
  try {
    // Await the context to get params
    const { params } = await context;
    const problemId = params.id;
    
    // Find 5 random problems to recommend (simplified approach)
    // In a production app, you would implement more sophisticated recommendation logic
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
    
    return NextResponse.json({
      similarProblems: randomProblems || []
    });
  } catch (error) {
    console.error('Error fetching similar problems:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 