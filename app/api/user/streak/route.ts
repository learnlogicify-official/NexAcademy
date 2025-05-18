import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserStreak } from '@/lib/streak-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await getUserStreak(userId);

    return NextResponse.json({
      currentStreak: data?.currentStreak ?? 0,
      longestStreak: data?.longestStreak ?? 0,
      lastActivityDate: data?.lastActivityDate ?? null,
      freezeCount: data?.freezeCount ?? 0,
    });
  } catch (error) {
    console.error('Error retrieving streak data:', error);
    return NextResponse.json({ error: 'Failed to retrieve streak data' }, { status: 500 });
  }
} 