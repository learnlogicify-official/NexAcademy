import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/problem/[id]/user-drafts
export async function GET(request: Request, context: Promise<{ params: { id: string } }>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { params } = await context;
    const problemId = params.id;
    const userId = session.user.id;

    // Get last language from UserProblemSettings
    const userProblemSettings = await prisma.userProblemSettings.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
    });

    // Get all code drafts for this user/problem
    const drafts = await prisma.userCodeDraft.findMany({
      where: {
        userId,
        problemId,
      },
    });

    // Build codeDrafts object: { [languageId]: code }
    const codeDrafts: Record<string, string> = {};
    drafts.forEach(draft => {
      // Use the language field as the key (should be languageId or Judge0 name)
      codeDrafts[draft.language] = draft.code;
    });

    return NextResponse.json({
      lastLanguage: userProblemSettings?.lastLanguage || null,
      codeDrafts,
    });
  } catch (error) {
    console.error('[API] Error fetching user drafts:', error);
    return NextResponse.json({ error: 'Failed to fetch user drafts' }, { status: 500 });
  }
}