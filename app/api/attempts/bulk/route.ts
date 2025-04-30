import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, assessmentIds } = await req.json();
    if (!userId || !Array.isArray(assessmentIds) || assessmentIds.length === 0) {
      return NextResponse.json({ error: "Missing userId or assessmentIds" }, { status: 400 });
    }
    // Fetch all attempts for the user and the given assessments, ordered by startedAt desc
    const attempts = await prisma.attempt.findMany({
      where: {
        userId,
        assessmentId: { in: assessmentIds },
      },
      orderBy: [{ assessmentId: "asc" }, { startedAt: "desc" }],
    });
    // Map to latest attempt per assessment
    const latestAttempts: Record<string, any> = {};
    for (const a of attempts) {
      if (!latestAttempts[a.assessmentId]) {
        latestAttempts[a.assessmentId] = a;
      }
    }
    return NextResponse.json(latestAttempts);
  } catch (error) {
    console.error("Error in bulk attempts endpoint:", error);
    return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 });
  }
} 