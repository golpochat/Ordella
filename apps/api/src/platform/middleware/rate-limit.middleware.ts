import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { TENANT_CONTEXT_KEY } from '../../common/constants/tenant-context-key';
import { RequestWithTenant } from '../../common/interfaces/request-with-tenant.interface';
import { loadDeploymentConfig } from '../config/deployment.config';
import { RateLimitService } from '../security/rate-limit.service';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly config = loadDeploymentConfig();

  constructor(private readonly rateLimit: RateLimitService) {}

  async use(req: RequestWithTenant, res: Response, next: NextFunction): Promise<void> {
    if (req.path.includes('/billing/webhook') || req.path.includes('/health')) {
      return next();
    }

    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? 'unknown';
    const ipResult = await this.rateLimit.check(
      this.rateLimit.ipKey(ip),
      this.config.rateLimitIpPerMinute,
    );
    if (!ipResult.allowed) {
      res.setHeader('Retry-After', '60');
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    const tenant = req[TENANT_CONTEXT_KEY];
    if (tenant?.tenantId) {
      const tenantResult = await this.rateLimit.check(
        this.rateLimit.tenantKey(tenant.tenantId),
        this.config.rateLimitTenantPerMinute,
      );
      if (!tenantResult.allowed) {
        res.setHeader('Retry-After', '60');
        throw new HttpException('Tenant rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }
      res.setHeader('X-RateLimit-Remaining-Tenant', String(tenantResult.remaining));
    }

    res.setHeader('X-RateLimit-Remaining-Ip', String(ipResult.remaining));
    next();
  }
}
