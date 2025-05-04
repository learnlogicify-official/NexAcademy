import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/problem/[id]/submissions
// Returns all submissions for the user/problem, with total runtime and memory for each submission
export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const problemId = context.params.id;
    const query = `
      SELECT "id", "allPassed", "runtime", "memory", "language", "submittedAt", "code", "testcasesPassed", "totalTestcases"
      FROM "ProblemSubmission"
      WHERE "userId" = '${userId}' AND "problemId" = '${problemId}'
      ORDER BY "submittedAt" DESC
    `;
    const submissions = await prisma.$queryRawUnsafe(query);
    
    // Ensure numeric values are returned as numbers
    const processedSubmissions = (submissions as any[]).map((sub: any) => ({
      ...sub,
      testcasesPassed: parseInt(sub.testcasesPassed) || 0,
      totalTestcases: parseInt(sub.totalTestcases) || 0
    }));
    
    return NextResponse.json({ submissions: processedSubmissions });
  } catch (error) {
    return NextResponse.json({ error: "Server error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 