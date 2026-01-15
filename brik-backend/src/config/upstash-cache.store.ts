/**
 * Upstash Redis Cache Store
 *
 * Custom cache store implementation that wraps Upstash Redis
 * to work with NestJS @nestjs/cache-manager
 *
 * Upstash is serverless-native and perfect for Vercel:
 * - HTTP-based (no persistent connections)
 * - Edge-ready with global replication
 * - No connection pooling issues
 * - Works seamlessly with serverless functions
 */

import { Redis } from '@upstash/redis';

export interface UpstashCacheStore {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  reset(): Promise<void>;
  mget(...keys: string[]): Promise<unknown[]>;
  mset(args: [string, unknown][], ttl?: number): Promise<void>;
  mdel(...keys: string[]): Promise<void>;
  keys(pattern?: string): Promise<string[]>;
  ttl(key: string): Promise<number>;
}

/**
 * Creates an Upstash Redis cache store for cache-manager
 *
 * @param config - Upstash Redis configuration
 * @returns Cache store compatible with cache-manager
 */
export function createUpstashStore(config: {
  url: string;
  token: string;
}): UpstashCacheStore {
  const redis = new Redis({
    url: config.url,
    token: config.token,
  });

  return {
    async get<T>(key: string): Promise<T | undefined> {
      const value = await redis.get(key);
      return value as T | undefined;
    },

    async set(key: string, value: any, ttl?: number): Promise<void> {
      if (ttl) {
        // TTL is in milliseconds, Upstash expects seconds
        await redis.setex(key, Math.floor(ttl / 1000), value);
      } else {
        await redis.set(key, value);
      }
    },

    async del(key: string): Promise<void> {
      await redis.del(key);
    },

    async reset(): Promise<void> {
      // Upstash doesn't support FLUSHDB via REST API
      // We'll implement a pattern-based deletion
      const keys = await redis.keys('*');
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    },

    async mget(...keys: string[]): Promise<unknown[]> {
      if (keys.length === 0) return [];
      return await redis.mget(...keys);
    },

    async mset(args: [string, unknown][], ttl?: number): Promise<void> {
      // Upstash REST API doesn't support MSET with TTL
      // We'll use pipeline for batch operations
      const pipeline = redis.pipeline();

      for (const [key, value] of args) {
        if (ttl) {
          pipeline.setex(key, Math.floor(ttl / 1000), value);
        } else {
          pipeline.set(key, value);
        }
      }

      await pipeline.exec();
    },

    async mdel(...keys: string[]): Promise<void> {
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    },

    async keys(pattern: string = '*'): Promise<string[]> {
      return await redis.keys(pattern);
    },

    async ttl(key: string): Promise<number> {
      const ttlSeconds = await redis.ttl(key);
      // Convert seconds to milliseconds for cache-manager compatibility
      return ttlSeconds * 1000;
    },
  };
}
