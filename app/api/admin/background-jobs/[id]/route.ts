import { NextRequest, NextResponse } from 'next/server';
import { getCache } from '@/lib/redis/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const requestId = params.id;
    
    // Try to get stats request status
    const statsRequest = await getCache(`stats_request:${requestId}`);
    if (statsRequest) {
      return NextResponse.json(statsRequest);
    }
    
    // Try to get export request status
    const exportRequest = await getCache(`export_request:${requestId}`);
    if (exportRequest) {
      return NextResponse.json(exportRequest);
    }
    
    // If not found in either cache
    return NextResponse.json(
      { error: 'Job not found or expired' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}