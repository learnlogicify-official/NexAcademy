# Admin Question Bank Additional Optimizations

## Overview

This guide provides implementation steps for additional optimizations to further improve the admin question bank performance beyond the initial optimizations. These enhancements focus on server-side caching, background processing, and frontend rendering optimizations.

## Prerequisites

- The initial optimizations from `ADMIN_QUESTION_BANK_IMPLEMENTATION.md` have been applied
- Node.js 16+ and npm/yarn installed
- PostgreSQL database with Prisma ORM

## Implementation Steps

### 1. Add Redis Caching for Question Data

First, install Redis and the required dependencies:

```bash
npm install ioredis
```

Create a Redis client utility:

```bash
mkdir -p /lib/redis
touch /lib/redis/client.ts
```

Implement the Redis client in `/lib/redis/client.ts`:

```typescript
import Redis from 'ioredis';

// Configure Redis client
const getRedisClient = () => {
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    // Enable keyPrefix to avoid key collisions with other applications
    keyPrefix: 'nexacademy:',
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  return redis;
};

// Create a singleton instance
let redisClient: Redis | null = null;

export const getRedis = () => {
  if (!redisClient) {
    redisClient = getRedisClient();
  }
  return redisClient;
};

// Cache helper functions
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    const data = await redis.get(key);
    return data ? JSON.parse(data) as T : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function setCache<T>(key: string, data: T, ttlSeconds = 300): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const redis = getRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Redis invalidation error:', error);
  }
}
```

Update the optimized questions API endpoint to use Redis caching in `/app/api/questions/optimized/route.ts`:

```typescript
import { getCache, setCache } from '@/lib/redis/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // ... existing parameter extraction code ...
    
    // Generate a cache key based on query parameters
    const cacheKey = `questions:${JSON.stringify({
      type,
      status,
      folderId,
      search,
      page,
      limit,
      includeSubcategories,
      assessmentId,
      includeSectionMarks,
      loadFullDetails,
      tagIds
    })}`;
    
    // Try to get data from cache first
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // ... existing query logic ...
    
    const result = {
      questions: formattedQuestions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
    
    // Cache the result with appropriate TTL
    // Use shorter TTL for frequently changing data
    const ttl = loadFullDetails ? 60 : 300; // 1 minute for details, 5 minutes for list view
    await setCache(cacheKey, result, ttl);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
```

Add cache invalidation to the question update/create endpoints in `/app/api/questions/[id]/route.ts`:

```typescript
import { invalidateCache } from '@/lib/redis/client';

// In your PUT or POST handler
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // ... existing update logic ...
  
  // Invalidate cache after successful update
  await invalidateCache('questions:*');
  
  return NextResponse.json({ success: true });
}
```

### 2. Implement Background Processing for Statistics

Create a background worker for statistics calculation:

```bash
mkdir -p /lib/workers
touch /lib/workers/statsWorker.ts
```

Implement the statistics worker in `/lib/workers/statsWorker.ts`:

```typescript
import { prisma } from '@/lib/prisma';
import { getRedis, setCache } from '@/lib/redis/client';

export async function calculateQuestionStats(folderId?: string) {
  try {
    console.log('Starting background statistics calculation...');
    const startTime = Date.now();
    
    // Build the query conditions
    const where: any = {};
    if (folderId) {
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
    }
    
    // Calculate statistics in parallel
    const [typeStats, statusStats, difficultyStats] = await Promise.all([
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
      })
    ]);
    
    // Format the results
    const stats = {
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
      
      calculatedAt: new Date().toISOString()
    };
    
    // Cache the results
    const cacheKey = `question_stats:${folderId || 'all'}`;
    await setCache(cacheKey, stats, 3600); // Cache for 1 hour
    
    const endTime = Date.now();
    console.log(`Statistics calculation completed in ${endTime - startTime}ms`);
    
    return stats;
  } catch (error) {
    console.error('Error calculating question statistics:', error);
    throw error;
  }
}
```

Create an API endpoint to trigger and retrieve statistics:

```bash
mkdir -p /app/api/questions/stats
touch /app/api/questions/stats/route.ts
```

Implement the statistics API in `/app/api/questions/stats/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCache } from '@/lib/redis/client';
import { calculateQuestionStats } from '@/lib/workers/statsWorker';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const folderId = searchParams.get('folderId');
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    // Generate cache key
    const cacheKey = `question_stats:${folderId || 'all'}`;
    
    // Try to get from cache first unless force refresh is requested
    if (!forceRefresh) {
      const cachedStats = await getCache(cacheKey);
      if (cachedStats) {
        return NextResponse.json(cachedStats);
      }
    }
    
    // If not in cache or force refresh, calculate stats
    // This will also update the cache
    const stats = await calculateQuestionStats(folderId || undefined);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching question statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question statistics' },
      { status: 500 }
    );
  }
}
```

### 3. Optimize Frontend Rendering with Virtualized Lists

Install the required dependencies:

```bash
npm install react-window react-virtualized-auto-sizer
```

Create a virtualized question list component:

```bash
touch /components/admin/VirtualizedQuestionList.tsx
```

Implement the virtualized list in `/components/admin/VirtualizedQuestionList.tsx`:

```tsx
import React from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Question } from '@/types/question';

interface VirtualizedQuestionListProps {
  questions: Question[];
  onQuestionSelect: (question: Question) => void;
  selectedQuestionId?: string;
  isLoading: boolean;
}

const VirtualizedQuestionList: React.FC<VirtualizedQuestionListProps> = ({
  questions,
  onQuestionSelect,
  selectedQuestionId,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <p className="text-muted-foreground">No questions found</p>
      </div>
    );
  }

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const question = questions[index];
    const isSelected = selectedQuestionId === question.id;
    
    return (
      <div 
        style={style} 
        className={`p-4 border-b hover:bg-accent/50 cursor-pointer transition-colors ${isSelected ? 'bg-accent' : ''}`}
        onClick={() => onQuestionSelect(question)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{question.name}</h3>
            <p className="text-sm text-muted-foreground truncate max-w-[500px]">
              {question.type === 'MCQ' 
                ? question.mCQQuestion?.questionText 
                : question.codingQuestion?.questionText}
            </p>
          </div>
          <div className="flex space-x-2">
            <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
              {question.type === 'MCQ' ? 'Multiple Choice' : 'Coding'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${question.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              {question.status}
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center text-xs text-muted-foreground">
          <span>Folder: {question.folder?.name || 'None'}</span>
          <span className="mx-2">•</span>
          <span>Updated: {new Date(question.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[600px] w-full border rounded-md">
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            itemCount={questions.length}
            itemSize={100} // Adjust based on your row height
            width={width}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedQuestionList;
```

Update the admin questions page to use the virtualized list:

```tsx
// In /app/admin/questions/page.tsx
import VirtualizedQuestionList from '@/components/admin/VirtualizedQuestionList';

// Replace the existing question list rendering with:
<VirtualizedQuestionList 
  questions={filteredQuestions}
  onQuestionSelect={(question) => loadQuestionDetails(question.id)}
  selectedQuestionId={selectedQuestion?.id}
  isLoading={isLoading}
/>
```

### 4. Implement Code Splitting for Admin Pages

Update the Next.js configuration to enable code splitting in `next.config.mjs`:

```javascript
const nextConfig = {
  // ... existing config
  
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  
  // Configure chunking for better code splitting
  experimental: {
    // ... existing experimental options
    optimizeCss: true,
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'lodash']
  },
  
  // Configure webpack for better performance
  webpack: (config, { isServer }) => {
    // Optimize images
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|webp)$/i,
      use: [
        {
          loader: 'responsive-loader',
          options: {
            adapter: require('responsive-loader/sharp'),
            sizes: [320, 640, 960, 1200, 1800, 2400],
            placeholder: true,
            placeholderSize: 20,
          },
        },
      ],
    });
    
    return config;
  },
};
```

Implement dynamic imports for the admin question components:

```tsx
// In /app/admin/questions/page.tsx
import dynamic from 'next/dynamic';

// Dynamically import heavy components
const QuestionEditor = dynamic(
  () => import('@/components/admin/QuestionEditor'),
  { 
    loading: () => <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>,
    ssr: false // Disable server-side rendering for editor components
  }
);

const StatsView = dynamic(
  () => import('@/components/admin/QuestionStats'),
  { loading: () => <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div> }
);
```

### 5. Add Environment Variables for Redis Configuration

Update your `.env` file with Redis configuration:

```
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## Performance Monitoring

After implementing these optimizations, monitor the performance improvements:

1. **Server Response Time**: Monitor the API response times for the questions endpoint
   - Expected improvement: 80-90% reduction in response time for cached requests

2. **Frontend Rendering Performance**: Use Chrome DevTools Performance tab to measure:
   - Time to First Contentful Paint (FCP)
   - Time to Interactive (TTI)
   - Expected improvement: 40-50% reduction in rendering time for large question sets

3. **Memory Usage**: Monitor client-side memory usage with virtualized lists
   - Expected improvement: 70-80% reduction in memory usage for large question sets

## Troubleshooting

If you encounter issues with the Redis implementation:

1. Verify Redis is running: `redis-cli ping` should return `PONG`
2. Check Redis connection logs for authentication or connectivity issues
3. Ensure the Redis cache keys are being properly generated and invalidated

For virtualized list issues:

1. Ensure row heights are consistent or use variable height lists if needed
2. Check for React key warnings which can affect virtualization performance
3. Verify that the container has a fixed height or uses AutoSizer correctly

## Next Steps

After implementing these optimizations, consider these additional improvements:

1. Implement server-side search indexing with Elasticsearch for more efficient text searches
2. Add real-time updates using WebSockets for collaborative editing
3. Implement progressive loading of question assets (images, attachments)
4. Add performance telemetry to track and analyze long-term performance trends