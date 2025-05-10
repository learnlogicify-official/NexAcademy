import { NextRequest, NextResponse } from 'next/server';
import { statsQueue, dataExportQueue } from '@/lib/queue/config';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { v4 as uuidv4 } from 'uuid';
import { setCache } from '@/lib/redis/client';

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const body = await request.json();
    const { jobType, params } = body;
    
    // Generate a unique request ID
    const requestId = uuidv4();
    
    // Handle different job types
    switch (jobType) {
      case 'calculate-stats': {
        // Create a job in the stats queue
        const job = await statsQueue.add({
          ...params,
          requestId
        }, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000
          }
        });
        
        // Store initial status in cache
        await setCache(`stats_request:${requestId}`, {
          status: 'processing',
          jobId: job.id,
          createdAt: new Date().toISOString()
        }, 3600); // Cache for 1 hour
        
        return NextResponse.json({
          success: true,
          requestId,
          jobId: job.id,
          status: 'processing'
        });
      }
      
      case 'export-data': {
        // Create a job in the data export queue
        const job = await dataExportQueue.add({
          ...params,
          requestId
        }, {
          attempts: 2,
          backoff: {
            type: 'fixed',
            delay: 10000
          }
        });
        
        // Store initial status in cache
        await setCache(`export_request:${requestId}`, {
          status: 'processing',
          jobId: job.id,
          createdAt: new Date().toISOString()
        }, 3600); // Cache for 1 hour
        
        return NextResponse.json({
          success: true,
          requestId,
          jobId: job.id,
          status: 'processing'
        });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid job type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating background job:', error);
    return NextResponse.json(
      { error: 'Failed to create background job' },
      { status: 500 }
    );
  }
}

// Get all jobs (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get jobs from both queues
    const [statsJobs, exportJobs] = await Promise.all([
      statsQueue.getJobs(['active', 'waiting', 'completed', 'failed']),
      dataExportQueue.getJobs(['active', 'waiting', 'completed', 'failed'])
    ]);
    
    // Format the response
    const formattedJobs = [
      ...statsJobs.map(job => ({
        id: job.id,
        type: 'statistics',
        status: job.finishedOn ? (job.failedReason ? 'failed' : 'completed') : (job.processedOn ? 'active' : 'waiting'),
        createdAt: new Date(job.timestamp).toISOString(),
        finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
        data: job.data,
        error: job.failedReason || null
      })),
      ...exportJobs.map(job => ({
        id: job.id,
        type: 'data-export',
        status: job.finishedOn ? (job.failedReason ? 'failed' : 'completed') : (job.processedOn ? 'active' : 'waiting'),
        createdAt: new Date(job.timestamp).toISOString(),
        finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
        data: job.data,
        error: job.failedReason || null
      }))
    ];
    
    // Sort by creation time (newest first)
    formattedJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({
      jobs: formattedJobs
    });
  } catch (error) {
    console.error('Error fetching background jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch background jobs' },
      { status: 500 }
    );
  }
}