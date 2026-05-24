import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';
import { loadDeploymentConfig } from '../config/deployment.config';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'down';
  checks: Record<string, { status: 'ok' | 'down'; latencyMs?: number; message?: string }>;
}

@Injectable()
export class HealthService implements OnModuleDestroy {
  private readonly logger = new Logger(HealthService.name);
  private readonly config = loadDeploymentConfig();
  private redis: Redis | null = null;

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    if (this.config.redisUrl) {
      this.redis = new Redis(this.config.redisUrl, { maxRetriesPerRequest: 1, lazyConnect: true });
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis?.quit();
  }

  async check(): Promise<HealthCheckResult> {
    const checks: HealthCheckResult['checks'] = {};

    checks.database = await this.checkDatabase();
    checks.redis = await this.checkRedis();
    checks.queue = await this.checkQueue();

    const values = Object.values(checks);
    const status = values.every((c) => c.status === 'ok')
      ? 'ok'
      : values.some((c) => c.status === 'down')
        ? 'down'
        : 'degraded';

    return { status, checks };
  }

  async liveness(): Promise<{ status: 'ok' }> {
    return { status: 'ok' };
  }

  private async checkDatabase(): Promise<HealthCheckResult['checks'][string]> {
    const start = Date.now();
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok', latencyMs: Date.now() - start };
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        message: (error as Error).message,
      };
    }
  }

  private async checkRedis(): Promise<HealthCheckResult['checks'][string]> {
    if (!this.redis) {
      return { status: 'ok', message: 'Redis not configured' };
    }
    const start = Date.now();
    try {
      if (this.redis.status !== 'ready') {
        await this.redis.connect();
      }
      const pong = await this.redis.ping();
      return {
        status: pong === 'PONG' ? 'ok' : 'down',
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        message: (error as Error).message,
      };
    }
  }

  private async checkQueue(): Promise<HealthCheckResult['checks'][string]> {
    // BullMQ + Redis queue health placeholder until workers are wired
    if (!this.config.redisUrl) {
      return { status: 'ok', message: 'Queue not configured (BullMQ placeholder)' };
    }
    return { status: 'ok', message: 'BullMQ health check placeholder' };
  }
}
