import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/problem/[id]/submission/[submissionId]
export async function GET(request: Request, context: { params: { id: string, submissionId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { id: problemId, submissionId } = context.params;
    
    // Verify this submission belongs to the current user
    const query = `
      SELECT 
        "id", "allPassed", "runtime", "memory", "language", "submittedAt", 
        "code", "testcasesPassed", "totalTestcases", "runtimePercentile", 
        "memoryPercentile"
      FROM "ProblemSubmission"
      WHERE "id" = '${submissionId}' AND "userId" = '${userId}' AND "problemId" = '${problemId}'
      LIMIT 1
    `;
    
    const results = await prisma.$queryRawUnsafe(query);
    const submission = results && Array.isArray(results) && results.length > 0 ? results[0] : null;
    
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }
    
    // Log submission data for debugging
    console.log("[API] Submission data:", {
      id: submission.id,
      testcasesPassed: submission.testcasesPassed,
      totalTestcases: submission.totalTestcases,
      type: {
        testcasesPassed: typeof submission.testcasesPassed,
        totalTestcases: typeof submission.totalTestcases
      }
    });
    
    // Ensure numeric values are returned as numbers, not strings
    const processedSubmission = {
      ...submission,
      testcasesPassed: parseInt(submission.testcasesPassed) || 0,
      totalTestcases: parseInt(submission.totalTestcases) || 0
    };
    
    return NextResponse.json({ submission: processedSubmission });
  } catch (error) {
    return NextResponse.json({ 
      error: "Server error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 