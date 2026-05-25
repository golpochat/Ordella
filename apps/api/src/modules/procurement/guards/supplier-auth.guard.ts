import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TENANT_CONTEXT_KEY } from '../../../common/constants/tenant-context-key';
import { TenantContext } from '../../../common/interfaces';
import { SUPPLIER_AUTH_KEY } from '../decorators/current-supplier.decorator';
import { SupplierAuthPayload } from '../types/supplier-auth-payload';

@Injectable()
export class SupplierAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      [TENANT_CONTEXT_KEY]?: TenantContext;
      [SUPPLIER_AUTH_KEY]?: SupplierAuthPayload;
    }>();
    const token = this.extractBearerToken(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException('Supplier session is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<SupplierAuthPayload>(token);
      const tenant = request[TENANT_CONTEXT_KEY];
      if (payload.type !== 'supplier' || !payload.sub || payload.tenantId !== tenant?.tenantId) {
        throw new UnauthorizedException('Invalid supplier session');
      }
      request[SUPPLIER_AUTH_KEY] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired supplier session');
    }
  }

  private extractBearerToken(header: string | string[] | undefined): string | null {
    const value = Array.isArray(header) ? header[0] : header;
    const match = value?.match(/^Bearer\s+(.+)$/i);
    return match?.[1] ?? null;
  }
}
