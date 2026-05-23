import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { TENANT_CONTEXT_KEY } from '../constants/tenant-context-key';
import { TenantContext } from '../interfaces/tenant-context.interface';
import { RequestWithTenant } from '../interfaces/request-with-tenant.interface';

/**
 * Resolves tenant from subdomain, X-Tenant-Id header, or API key (placeholder).
 * JWT-based resolution is applied after authentication in JwtAuthGuard.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: RequestWithTenant, _res: Response, next: NextFunction): void {
    const headerTenantId = req.headers['x-tenant-id'] as string | undefined;
    const subdomain = this.extractSubdomain(req.hostname);

    if (headerTenantId) {
      req[TENANT_CONTEXT_KEY] = {
        tenantId: headerTenantId,
        source: 'header',
      } satisfies TenantContext;
    } else if (subdomain) {
      req[TENANT_CONTEXT_KEY] = {
        tenantId: subdomain,
        source: 'subdomain',
      } satisfies TenantContext;
    }

    // TODO: resolve tenant from API key when Authorization uses ApiKey scheme

    next();
  }

  private extractSubdomain(hostname: string): string | undefined {
    const parts = hostname.split('.');
    if (parts.length > 2 && parts[0] !== 'www') {
      return parts[0];
    }
    return undefined;
  }
}
