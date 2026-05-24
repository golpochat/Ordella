import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { TENANT_CONTEXT_KEY } from '../../common/constants/tenant-context-key';
import { RequestWithTenant } from '../../common/interfaces/request-with-tenant.interface';
import { TenantRoutingService } from '../routing/tenant-routing.service';

@Injectable()
export class TenantRoutingMiddleware implements NestMiddleware {
  constructor(private readonly routing: TenantRoutingService) {}

  async use(req: RequestWithTenant, _res: Response, next: NextFunction): Promise<void> {
    try {
      const context = await this.routing.resolveFromRequest(req);
      if (context) {
        req[TENANT_CONTEXT_KEY] = context;
      }
    } catch {
      // Unresolved host is valid for onboarding / public routes
    }
    next();
  }
}
