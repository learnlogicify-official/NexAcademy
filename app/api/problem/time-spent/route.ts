import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { problemId, timeSpentMs, isHeartbeat = false } = await req.json();

    if (!problemId || typeof timeSpentMs !== 'number') {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Update or create time spent record
    const timeSpent = await prisma.problemTimeSpent.upsert({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId,
        },
      },
      update: {
        timeSpentMs: { increment: timeSpentMs },
        lastActive: new Date(),
        ...(isHeartbeat ? {} : { sessionCount: { increment: 1 } }),
      },
      create: {
        userId: session.user.id,
        problemId,
        timeSpentMs,
        sessionCount: 1,
      },
    });

    return NextResponse.json({ success: true, timeSpent });
  } catch (error) {
    console.error('Error updating time spent:', error);
    return NextResponse.json(
      { error: 'Failed to update time spent' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const problemId = url.searchParams.get('problemId');

    if (!problemId) {
      return NextResponse.json(
        { error: "Problem ID is required" },
        { status: 400 }
      );
    }

    const timeSpent = await prisma.problemTimeSpent.findUnique({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId,
        },
      },
    });

    return NextResponse.json({ timeSpent });
  } catch (error) {
    console.error('Error fetching time spent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time spent' },
      { status: 500 }
    );
  }
} 