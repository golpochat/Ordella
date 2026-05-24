import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { loadDeploymentConfig } from '../config/deployment.config';

type Bucket = { count: number; resetAt: number };

@Injectable()
export class RateLimitService implements OnModuleDestroy {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly config = loadDeploymentConfig();
  private readonly memory = new Map<string, Bucket>();
  private redis: Redis | null = null;

  constructor() {
    if (this.config.redisUrl) {
      this.redis = new Redis(this.config.redisUrl, { maxRetriesPerRequest: 1, lazyConnect: true });
      void this.redis.connect().catch((err) => {
        this.logger.warn(`Redis rate limit unavailable: ${(err as Error).message}`);
        this.redis = null;
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis?.quit();
  }

  async check(key: string, limit: number, windowSec = 60): Promise<{ allowed: boolean; remaining: number }> {
    if (this.redis) {
      return this.checkRedis(key, limit, windowSec);
    }
    return this.checkMemory(key, limit, windowSec);
  }

  tenantKey(tenantId: string): string {
    return `rl:tenant:${tenantId}`;
  }

  ipKey(ip: string): string {
    return `rl:ip:${ip}`;
  }

  private async checkRedis(
    key: string,
    limit: number,
    windowSec: number,
  ): Promise<{ allowed: boolean; remaining: number }> {
    const redisKey = `ordella:${key}`;
    const count = await this.redis!.incr(redisKey);
    if (count === 1) {
      await this.redis!.expire(redisKey, windowSec);
    }
    const remaining = Math.max(0, limit - count);
    return { allowed: count <= limit, remaining };
  }

  private checkMemory(
    key: string,
    limit: number,
    windowSec: number,
  ): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const bucket = this.memory.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.memory.set(key, { count: 1, resetAt: now + windowSec * 1000 });
      return { allowed: true, remaining: limit - 1 };
    }
    bucket.count += 1;
    const remaining = Math.max(0, limit - bucket.count);
    return { allowed: bucket.count <= limit, remaining };
  }
}
