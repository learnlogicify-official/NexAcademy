import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserXP, getXPLeaderboard } from '@/lib/xp-service';

/**
 * GET: Retrieve the user's XP information
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse URL parameters
    const url = new URL(request.url);
    const leaderboard = url.searchParams.get('leaderboard') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    if (leaderboard) {
      // Return leaderboard data
      const data = await getXPLeaderboard(limit);
      return NextResponse.json({ leaderboard: data });
    } else {
      // Return specific user's XP info
      const userId = session.user.id;
      const data = await getUserXP(userId);
      
      return NextResponse.json({
        xp: data?.xp || 0,
        level: data?.level || 1
      });
    }
  } catch (error) {
    console.error('Error retrieving XP data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve XP data' },
      { status: 500 }
    );
  }
} 