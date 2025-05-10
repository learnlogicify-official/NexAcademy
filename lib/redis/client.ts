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