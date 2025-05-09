# Redis Caching Setup Guide for NexAcademy

## Overview

This guide provides detailed instructions for setting up Redis caching in the NexAcademy application to improve performance of the admin question bank and other data-intensive features.

## Prerequisites

- Node.js 16+ and npm/yarn installed
- Access to install Redis locally or a Redis cloud instance
- Basic understanding of caching concepts

## Installation Steps

### 1. Install Redis Server

#### macOS (using Homebrew)

```bash
brew install redis
brew services start redis
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

#### Windows

Download and install from [Redis for Windows](https://github.com/microsoftarchive/redis/releases)

### 2. Verify Redis Installation

Test your Redis installation:

```bash
redis-cli ping
```

You should receive a `PONG` response if Redis is running correctly.

### 3. Install Redis Client for Node.js

Add the Redis client library to your project:

```bash
npm install ioredis
```

### 4. Configure Environment Variables

Add the following variables to your `.env` file:

```
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL_DEFAULT=300  # Default TTL in seconds (5 minutes)
REDIS_TTL_QUESTIONS=600  # Questions cache TTL (10 minutes)
REDIS_TTL_STATS=3600  # Statistics cache TTL (1 hour)
```

## Integration with NexAcademy

### 1. Create Redis Client Module

Follow the implementation in the `ADMIN_QUESTION_BANK_ADDITIONAL_OPTIMIZATIONS.md` document to create the Redis client utility at `/lib/redis/client.ts`.

### 2. Implement Cache Invalidation Strategy

Cache invalidation is critical for maintaining data consistency. Implement the following strategy:

#### Key Naming Convention

Use a consistent key naming pattern to organize and manage cache entries:

```
nexacademy:{entity}:{id}:{action}
```

Examples:
- `nexacademy:questions:list:page1:limit10`
- `nexacademy:question:abc123:details`
- `nexacademy:stats:folder123`

#### Invalidation Triggers

Invalidate relevant cache entries when data changes:

1. **Create/Update/Delete Question**: Invalidate question lists and stats
   ```typescript
   await invalidateCache('nexacademy:questions:*');
   await invalidateCache('nexacademy:stats:*');
   ```

2. **Update Folder**: Invalidate related question lists and stats
   ```typescript
   await invalidateCache(`nexacademy:questions:*:folder:${folderId}:*`);
   await invalidateCache(`nexacademy:stats:folder:${folderId}`);
   ```

### 3. Monitoring and Debugging

Implement monitoring to track cache performance:

```typescript
// Add to lib/redis/client.ts

let cacheHits = 0;
let cacheMisses = 0;

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    const data = await redis.get(key);
    
    if (data) {
      cacheHits++;
      return JSON.parse(data) as T;
    } else {
      cacheMisses++;
      return null;
    }
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export function getCacheStats() {
  const total = cacheHits + cacheMisses;
  const hitRate = total > 0 ? (cacheHits / total) * 100 : 0;
  
  return {
    hits: cacheHits,
    misses: cacheMisses,
    total,
    hitRate: `${hitRate.toFixed(2)}%`
  };
}
```

Create an admin endpoint to view cache statistics:

```typescript
// In /app/api/admin/cache-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCacheStats, getRedis } from '@/lib/redis/client';

export async function GET(request: NextRequest) {
  try {
    const stats = getCacheStats();
    const redis = getRedis();
    
    // Get memory usage info
    const info = await redis.info('memory');
    
    return NextResponse.json({
      cacheStats: stats,
      memoryInfo: info
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cache statistics' },
      { status: 500 }
    );
  }
}
```

## Performance Tuning

### 1. Optimize TTL Values

Adjust Time-To-Live (TTL) values based on data volatility:

- **Frequently changing data**: 1-5 minutes
- **Semi-stable data**: 10-30 minutes
- **Stable reference data**: 1-24 hours

### 2. Memory Management

Configure Redis memory limits to prevent out-of-memory issues:

```bash
# In redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

This sets a 256MB memory limit and uses the Least Recently Used (LRU) algorithm to evict keys when memory is full.

### 3. Compression

For large objects, consider compressing data before caching:

```typescript
import { deflate, inflate } from 'zlib';
import { promisify } from 'util';

const deflateAsync = promisify(deflate);
const inflateAsync = promisify(inflate);

export async function setCacheCompressed<T>(key: string, data: T, ttlSeconds = 300): Promise<void> {
  try {
    const stringData = JSON.stringify(data);
    const compressedData = await deflateAsync(Buffer.from(stringData));
    
    const redis = getRedis();
    await redis.set(key, compressedData.toString('base64'), 'EX', ttlSeconds);
  } catch (error) {
    console.error('Redis compressed set error:', error);
  }
}

export async function getCacheCompressed<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    const data = await redis.get(key);
    
    if (!data) return null;
    
    const decompressed = await inflateAsync(Buffer.from(data, 'base64'));
    return JSON.parse(decompressed.toString()) as T;
  } catch (error) {
    console.error('Redis compressed get error:', error);
    return null;
  }
}
```

## Production Deployment Considerations

### 1. Redis Cloud Services

For production, consider using managed Redis services:

- **Redis Cloud**: Offers fully-managed Redis instances
- **Amazon ElastiCache**: AWS managed Redis service
- **Azure Cache for Redis**: Microsoft Azure's Redis offering
- **Upstash**: Serverless Redis with pay-per-use pricing

### 2. Security

Secure your Redis instance:

1. **Authentication**: Always set a strong password
2. **Network Security**: Use firewall rules to restrict access
3. **TLS/SSL**: Enable encrypted connections for production

### 3. High Availability

For critical applications, configure Redis replication:

- **Master-Replica Setup**: Automatic failover capability
- **Redis Sentinel**: Monitors Redis instances and performs automatic failover
- **Redis Cluster**: Distributes data across multiple nodes

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Verify Redis is running: `redis-cli ping`
   - Check firewall settings
   - Confirm correct host/port configuration

2. **Authentication Failed**
   - Verify password in environment variables
   - Check Redis configuration for `requirepass` setting

3. **Memory Issues**
   - Monitor memory usage: `redis-cli info memory`
   - Adjust `maxmemory` setting
   - Review key expiration policies

4. **Slow Performance**
   - Run `redis-cli --latency` to check connection latency
   - Use `redis-cli slowlog get 10` to identify slow commands
   - Consider network proximity between application and Redis server

## Conclusion

Implementing Redis caching will significantly improve the performance of the admin question bank and other data-intensive features in NexAcademy. By following this guide, you'll establish a robust caching infrastructure that can be extended to other parts of the application as needed.

Regularly monitor cache hit rates and memory usage to fine-tune your caching strategy for optimal performance.