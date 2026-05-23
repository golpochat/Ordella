import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TENANT_CONTEXT_KEY } from '../constants/tenant-context-key';
import { TenantContext } from '../interfaces/tenant-context.interface';

/**
 * Ensures a tenant context is present on the request.
 * Use on routes that require tenant isolation.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ [TENANT_CONTEXT_KEY]?: TenantContext }>();
    const tenant = request[TENANT_CONTEXT_KEY];

    if (!tenant?.tenantId) {
      throw new UnauthorizedException({
        code: 'TENANT_REQUIRED',
        message: 'Tenant context is required',
      });
    }

    return true;
  }
}
