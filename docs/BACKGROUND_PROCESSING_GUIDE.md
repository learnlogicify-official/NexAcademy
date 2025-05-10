# Background Processing Implementation Guide

## Overview

This guide provides detailed instructions for implementing background processing in the NexAcademy application to improve performance of computationally intensive operations like statistics calculations for the admin question bank.

## Prerequisites

- Node.js 16+ and npm/yarn installed
- Upstash Redis account (see below for setup)
- Basic understanding of asynchronous processing concepts

## Implementation Steps

### 1. Install Required Dependencies

First, install the necessary packages for background processing:

```bash
npm install bull @bull-board/api @bull-board/express @upstash/redis
```

### 2. Create Queue Configuration

Create a new directory and file for queue configuration:

```bash
mkdir -p lib/queue
touch lib/queue/config.ts
```

Implement the queue configuration in `lib/queue/config.ts`:

```typescript
import Queue from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

// Configure Upstash Redis connection for Bull
const redisConfig = {
  // Option 1: Using TCP connection
  redis: {
    port: parseInt(process.env.UPSTASH_REDIS_PORT || '6379'),
    host: process.env.UPSTASH_REDIS_HOST,
    password: process.env.UPSTASH_REDIS_PASSWORD,
    tls: { rejectUnauthorized: false }, // Required for Upstash Redis
    maxRetriesPerRequest: 3,
    enableReadyCheck: false, // Recommended for serverless environments
  },
  // Option 2: Using connection string (alternative)
  // url: process.env.UPSTASH_REDIS_URL,
  
  // Bull-specific settings optimized for Upstash
  settings: {
    lockDuration: 30000, // 30 seconds
    stalledInterval: 30000, // How often check for stalled jobs
    maxStalledCount: 2, // Max number of times a job can be marked as stalled
    guardInterval: 5000, // How often check for completed jobs
  }
};

// Create queues
export const statsQueue = new Queue('statistics-processing', redisConfig);
export const dataExportQueue = new Queue('data-export', redisConfig);

// Configure Bull Board (admin UI)
export const setupBullBoard = (app: any) => {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  
  createBullBoard({
    queues: [
      new BullAdapter(statsQueue),
      new BullAdapter(dataExportQueue)
    ],
    serverAdapter,
  });
  
  // Add authentication middleware for the Bull Board
  app.use('/admin/queues', (req: any, res: any, next: any) => {
    // Check if user is authenticated and is an admin
    const session = req.session;
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return res.status(403).send('Unauthorized');
    }
    next();
  }, serverAdapter.getRouter());
};

// Process cleanup on application shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down queues...');
  await statsQueue.close();
  await dataExportQueue.close();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

### 3. Implement Statistics Worker

Create a worker file for processing statistics jobs:

```bash
touch lib/queue/statsWorker.ts
```

Implement the statistics worker in `lib/queue/statsWorker.ts`:

```typescript
import { prisma } from '@/lib/prisma';
import { statsQueue } from './config';
import { setCache } from '@/lib/redis/client';

interface StatsJobData {
  folderId?: string;
  includeSubfolders?: boolean;
  requestId: string;
}

// Process statistics calculation jobs
statsQueue.process(async (job) => {
  const { folderId, includeSubfolders, requestId } = job.data as StatsJobData;
  console.log(`Processing statistics job ${job.id} for folder ${folderId || 'all'}`);
  
  try {
    const startTime = Date.now();
    
    // Build the query conditions
    const where: any = {};
    
    if (folderId) {
      if (includeSubfolders) {
        // Get the folder and all subfolders
        const folder = await prisma.folder.findUnique({
          where: { id: folderId },
          select: { 
            id: true,
            subfolders: {
              select: {
                id: true
              }
            }
          }
        });
        
        if (folder) {
          const folderIds = [folderId];
          if (folder.subfolders && folder.subfolders.length > 0) {
            folder.subfolders.forEach(subfolder => {
              folderIds.push(subfolder.id);
            });
          }
          where.folderId = { in: folderIds };
        } else {
          where.folderId = folderId;
        }
      } else {
        where.folderId = folderId;
      }
    }
    
    // Calculate statistics in parallel for better performance
    const [typeStats, statusStats, difficultyStats, totalCount] = await Promise.all([
      // Count by type
      prisma.question.groupBy({
        by: ['type'],
        where,
        _count: true
      }),
      
      // Count by status
      prisma.question.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      
      // Count by difficulty
      prisma.question.groupBy({
        by: ['difficulty'],
        where,
        _count: true
      }),
      
      // Get total count
      prisma.question.count({ where })
    ]);
    
    // Calculate additional metrics
    const folderDistribution = await prisma.question.groupBy({
      by: ['folderId'],
      where,
      _count: true
    });
    
    // Get folder names for the distribution
    const folderIds = folderDistribution.map(item => item.folderId).filter(Boolean);
    const folders = folderIds.length > 0 ? await prisma.folder.findMany({
      where: { id: { in: folderIds as string[] } },
      select: { id: true, name: true }
    }) : [];
    
    // Format the results
    const stats = {
      summary: {
        total: totalCount,
        byType: typeStats.reduce((acc, curr) => {
          acc[curr.type] = curr._count;
          return acc;
        }, {} as Record<string, number>),
        
        byStatus: statusStats.reduce((acc, curr) => {
          acc[curr.status] = curr._count;
          return acc;
        }, {} as Record<string, number>),
        
        byDifficulty: difficultyStats.reduce((acc, curr) => {
          acc[curr.difficulty] = curr._count;
          return acc;
        }, {} as Record<string, number>),
      },
      
      distribution: {
        byFolder: folderDistribution.map(item => ({
          folderId: item.folderId,
          folderName: folders.find(f => f.id === item.folderId)?.name || 'Unknown',
          count: item._count
        }))
      },
      
      meta: {
        calculatedAt: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
        requestId
      }
    };
    
    // Cache the results
    const cacheKey = `question_stats:${folderId || 'all'}:${includeSubfolders ? 'with_subfolders' : 'no_subfolders'}`;
    await setCache(cacheKey, stats, 3600); // Cache for 1 hour
    
    // Also cache with the requestId for the client to retrieve
    await setCache(`stats_request:${requestId}`, {
      status: 'completed',
      data: stats
    }, 300); // Cache for 5 minutes
    
    console.log(`Statistics calculation completed in ${Date.now() - startTime}ms`);
    
    return stats;
  } catch (error) {
    console.error('Error calculating question statistics:', error);
    
    // Cache the error for the client to retrieve
    await setCache(`stats_request:${requestId}`, {
      status: 'error',
      error: 'Failed to calculate statistics'
    }, 300);
    
    throw error;
  }
});

// Log completed jobs
statsQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed successfully`);
});

// Log failed jobs
statsQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed with error: ${error.message}`);
});

export default statsQueue;
```

### 4. Setting Up Upstash Redis

1. Create an Upstash Redis database:

   - Sign up for an account at [Upstash](https://upstash.com/)
   - Create a new Redis database from the dashboard
   - Select the region closest to your application deployment
   - Copy the connection details (endpoint, port, and password)

2. Configure environment variables:

   Add the following to your `.env` file:

   ```
   # Upstash Redis Configuration
   UPSTASH_REDIS_HOST=your-redis-endpoint.upstash.io
   UPSTASH_REDIS_PORT=6379
   UPSTASH_REDIS_PASSWORD=your-redis-password
   ```

3. Update Redis client implementation:

   You have two options for implementing the Redis client with Upstash:

   **Option 1: Using ioredis (compatible with existing code)**

   ```typescript
   // In lib/redis/client.ts
   import Redis from 'ioredis';
   
   // Configure Redis client for Upstash
   const getRedisClient = () => {
     const redis = new Redis({
       port: parseInt(process.env.UPSTASH_REDIS_PORT || '6379'),
       host: process.env.UPSTASH_REDIS_HOST,
       password: process.env.UPSTASH_REDIS_PASSWORD,
       tls: { rejectUnauthorized: false },
       maxRetriesPerRequest: 3,
       enableReadyCheck: false,
     });
     
     redis.on('error', (err) => {
       console.error('Redis connection error:', err);
     });
     
     return redis;
   };
   
   // Rest of the Redis client implementation...
   ```

   **Option 2: Using @upstash/redis (recommended for serverless)**

   ```typescript
   // In lib/redis/client.ts
   import { Redis } from '@upstash/redis';
   
   // Create Upstash Redis client
   const redis = new Redis({
     url: process.env.UPSTASH_REDIS_REST_URL || '',
     token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
   });
   
   // Cache functions
   export const getCache = async (key: string) => {
     try {
       const data = await redis.get(key);
       return data ? JSON.parse(data as string) : null;
     } catch (error) {
       console.error('Redis get error:', error);
       return null;
     }
   };
   
   export const setCache = async (key: string, data: any, ttlSeconds: number) => {
     try {
       await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
       return true;
     } catch (error) {
       console.error('Redis set error:', error);
       return false;
     }
   };
   
   export const invalidateCache = async (pattern: string) => {
     try {
       const keys = await redis.keys(pattern);
       if (keys.length > 0) {
         await redis.del(...keys);
       }
       return true;
     } catch (error) {
       console.error('Redis invalidation error:', error);
       return false;
     }
   };
   ```

   If using Option 2, update your environment variables:

   ```
   # Upstash Redis REST API Configuration
   UPSTASH_REDIS_REST_URL=https://your-endpoint.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

### 5. Create API Endpoints for Background Processing

Create API endpoints to trigger and check background jobs:

```bash
mkdir -p app/api/admin/background-jobs
touch app/api/admin/background-jobs/route.ts
touch app/api/admin/background-jobs/[id]/route.ts
```

Implement the job creation endpoint in `app/api/admin/background-jobs/route.ts`:

```typescript
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
```

Implement the job status endpoint in `app/api/admin/background-jobs/[id]/route.ts`:

```typescript
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
```

### 5. Update the Admin Questions Page to Use Background Processing

Modify the admin questions page to use background processing for statistics:

```tsx
// In /app/admin/questions/page.tsx

// Add state for background job status
const [statsJobId, setStatsJobId] = useState<string | null>(null);
const [statsJobStatus, setStatsJobStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');

// Function to trigger background statistics calculation
const calculateStatsInBackground = async () => {
  try {
    setStatsJobStatus('processing');
    
    // Prepare query parameters for stats calculation
    const params: any = {};
    
    if (pendingFilters.subcategory !== 'all') {
      params.folderId = pendingFilters.subcategory;
    } else if (pendingFilters.category !== 'all') {
      params.folderId = pendingFilters.category;
    } else if (selectedFolder) {
      params.folderId = selectedFolder;
    }
    
    params.includeSubfolders = pendingFilters.includeSubcategories || false;
    
    // Create a background job
    const response = await fetch('/api/admin/background-jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobType: 'calculate-stats',
        params
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to start background job');
    }
    
    // Store the request ID
    setStatsJobId(result.requestId);
    
    // Poll for job completion
    pollJobStatus(result.requestId);
  } catch (error) {
    console.error('Error starting background stats calculation:', error);
    setStatsJobStatus('error');
    toast({
      title: 'Error',
      description: 'Failed to calculate statistics. Please try again.',
      variant: 'destructive'
    });
  }
};

// Function to poll job status
const pollJobStatus = async (requestId: string) => {
  try {
    const response = await fetch(`/api/admin/background-jobs/${requestId}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to check job status');
    }
    
    if (result.status === 'completed') {
      // Job completed successfully
      setStatsJobStatus('completed');
      setStatsData(result.data);
      setStatsLoaded(true);
    } else if (result.status === 'error') {
      // Job failed
      setStatsJobStatus('error');
      toast({
        title: 'Error',
        description: 'Failed to calculate statistics. Please try again.',
        variant: 'destructive'
      });
    } else {
      // Job still processing, poll again after a delay
      setTimeout(() => pollJobStatus(requestId), 2000);
    }
  } catch (error) {
    console.error('Error polling job status:', error);
    setStatsJobStatus('error');
  }
};

// Update the fetchStats function to use background processing
const fetchStats = async () => {
  if (statsJobStatus === 'processing') {
    // Already processing, don't start another job
    return;
  }
  
  calculateStatsInBackground();
};
```

### 6. Initialize Workers in Server Startup

Update your server startup code to initialize the workers:

```typescript
// In server.js or equivalent startup file
import { setupBullBoard } from './lib/queue/config';
import './lib/queue/statsWorker'; // Import to initialize the worker

// In your Express app setup
const app = express();
// ... other middleware

// Setup Bull Board UI
setupBullBoard(app);

// ... rest of server setup
```

### 7. Add Worker Process for Next.js (Optional)

For Next.js applications, you can create a separate worker process:

```bash
touch worker.js
```

Implement the worker process in `worker.js`:

```javascript
require('dotenv').config();

// Import the workers
require('./lib/queue/statsWorker');

console.log('Background workers started');

// Keep the process alive
setInterval(() => {}, 1000);
```

Update your `package.json` to include a worker script:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "worker": "node worker.js"
  }
}
```

### 8. Optimizing Bull for Upstash Redis

When using Bull with Upstash Redis, consider these optimizations for better performance and reliability:

1. **Job Concurrency Settings**

   Limit the number of concurrent jobs to avoid overwhelming Upstash Redis connections:

   ```typescript
   // In lib/queue/statsWorker.ts
   
   // Set concurrency limit
   statsQueue.process(10, async (job) => {
     // Job processing logic
   });
   ```

2. **Job Retention**

   Configure job retention settings to manage storage usage:

   ```typescript
   // In lib/queue/config.ts
   
   // Create queues with retention settings
   export const statsQueue = new Queue('statistics-processing', {
     ...redisConfig,
     defaultJobOptions: {
       removeOnComplete: 100, // Keep only 100 completed jobs
       removeOnFail: 200,     // Keep only 200 failed jobs
     }
   });
   ```

3. **Rate Limiting**

   Implement rate limiting for job creation to prevent overwhelming Upstash Redis:

   ```typescript
   // In app/api/admin/background-jobs/route.ts
   
   // Simple rate limiting
   const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
   const MAX_REQUESTS_PER_WINDOW = 20;
   
   let requestCount = 0;
   let windowStart = Date.now();
   
   // Before creating a job
   const now = Date.now();
   if (now - windowStart > RATE_LIMIT_WINDOW_MS) {
     requestCount = 0;
     windowStart = now;
   }
   
   if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
     return NextResponse.json(
       { error: 'Rate limit exceeded. Try again later.' },
       { status: 429 }
     );
   }
   
   requestCount++;
   
   // Proceed with job creation
   ```

4. **Connection Pooling**

   For high-throughput applications, consider implementing connection pooling:

   ```typescript
   // In lib/redis/pool.ts
   import Redis from 'ioredis';
   import { GenericPool } from 'generic-pool';
   
   const factory = {
     create: async () => {
       const client = new Redis({
         port: parseInt(process.env.UPSTASH_REDIS_PORT || '6379'),
         host: process.env.UPSTASH_REDIS_HOST,
         password: process.env.UPSTASH_REDIS_PASSWORD,
         tls: { rejectUnauthorized: false },
       });
       return client;
     },
     destroy: async (client) => {
       client.quit();
     }
   };
   
   const opts = {
     min: 2,  // Minimum connections
     max: 10, // Maximum connections
     acquireTimeoutMillis: 5000
   };
   
   export const redisPool = GenericPool.createPool(factory, opts);
   ```

## Performance Monitoring

After implementing background processing with Upstash Redis, monitor the performance improvements:

1. **API Response Time**: The API should respond almost immediately when triggering background jobs
   - Expected improvement: 95-99% reduction in wait time for statistics calculations
   - Use Upstash Redis dashboard to monitor command latency

2. **Server Load**: Monitor server CPU and memory usage during peak times
   - Expected improvement: More consistent server performance with reduced spikes
   - Reduced server resource usage since Redis is now managed by Upstash

3. **User Experience**: Measure perceived performance improvements
   - Expected improvement: Users can continue working while heavy calculations happen in the background

4. **Upstash Redis Metrics**: Monitor Upstash-specific performance metrics
   - Track connection count, memory usage, and commands per second in the Upstash dashboard
   - Set up alerts for abnormal queue sizes or processing delays
   - Monitor costs and usage patterns to optimize your Upstash plan

## Benefits of Upstash Redis for Background Processing

1. **Serverless Architecture**
   - No need to manage Redis servers or worry about scaling
   - Pay-per-use pricing model that scales with your application
   - Global availability with low latency

2. **Simplified Operations**
   - No need for Redis server installation or maintenance
   - Built-in monitoring and analytics
   - Automatic backups and high availability

3. **Cost Efficiency**
   - No idle costs when your application isn't processing jobs
   - No need for dedicated infrastructure
   - Predictable pricing based on actual usage

## Troubleshooting

### Common Issues

1. **Jobs Not Starting**
   - Verify Upstash Redis connection details are correct
   - Check for errors in worker initialization logs
   - Ensure the worker process is running
   - Verify network connectivity to Upstash Redis endpoint

2. **Jobs Failing**
   - Check the error logs for specific failure reasons
   - Verify database connections are working
   - Check for memory limits or timeouts
   - Ensure your Upstash Redis instance has enough connections available

3. **Slow Job Processing**
   - Optimize database queries in the worker
   - Consider increasing worker concurrency
   - Check network latency between your application and Upstash Redis
   - Consider using an Upstash Redis instance in a region closer to your application

## Next Steps

After implementing background processing with Upstash Redis, consider these additional improvements:

1. Add a dedicated admin dashboard for monitoring and managing background jobs
2. Implement job prioritization for different types of tasks
3. Add support for scheduled jobs (e.g., nightly statistics calculations)
4. Implement job progress reporting for long-running tasks
5. Utilize Upstash Redis REST API for serverless functions that need to interact with the queue
6. Set up Upstash Redis alerts for queue size and processing time thresholds
7. Implement a dead letter queue for failed jobs using Upstash Redis streams