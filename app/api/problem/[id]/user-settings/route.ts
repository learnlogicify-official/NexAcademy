import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET endpoint to retrieve user settings for a specific problem
export async function GET(request: Request, context: Promise<{ params: { id: string } }>) {
  try {
    // Get the session to check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get the problem ID from the URL params
    const { params } = await context;
    const problemId = params.id;
    const userId = session.user.id;

    console.log(`[API] Fetching settings for user ${userId} and problem ${problemId}`);

    // Find the user's settings for this problem
    const userProblemSettings = await prisma.userProblemSettings.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
    });

    // Find any saved code for this problem (could be for multiple languages)
    const savedCodeEntries = await prisma.userCodeDraft.findMany({
      where: {
        userId,
        problemId,
      },
    });

    // Transform saved code entries into a map of language -> code
    const savedCode: Record<string, string> = {};
    savedCodeEntries.forEach(entry => {
      if (entry.language && entry.code) {
        savedCode[entry.language] = entry.code;
      }
    });

    // Return a combined response with all user settings
    return NextResponse.json({
      success: true,
      settings: {
        lastLanguage: userProblemSettings?.lastLanguage || null,
        savedCode,
        // Add other settings as needed
      },
    });
  } catch (error) {
    console.error('[API] Error fetching user settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user settings' },
      { status: 500 }
    );
  }
} 