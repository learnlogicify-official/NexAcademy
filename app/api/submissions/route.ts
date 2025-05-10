import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Get session to verify the user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const problemId = url.searchParams.get('problemId');
    const userId = url.searchParams.get('userId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '5');

    // Validate query parameters
    if (!problemId) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    // Only allow fetching own submissions unless user is admin
    const requestedUserId = userId || session.user.id;
    if (requestedUserId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'You can only view your own submissions' }, { status: 403 });
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Fetch total count for pagination
    const totalCount = await db.problemSubmission.count({
      where: {
        problemId: problemId,
        userId: requestedUserId,
      },
    });

    // Fetch submissions with pagination
    const submissions = await db.problemSubmission.findMany({
      where: {
        problemId: problemId,
        userId: requestedUserId,
      },
      orderBy: {
        submittedAt: 'desc',
      },
      skip,
      take: pageSize,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Return submissions with pagination info
    return NextResponse.json({
      submissions,
      total: totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
} 