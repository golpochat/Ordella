import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TENANT_CONTEXT_KEY } from '../../../common/constants/tenant-context-key';
import { TenantContext } from '../../../common/interfaces';
import { PartnerAuthPayload } from '../types/partner-auth-payload';
import { PARTNER_AUTH_KEY } from '../decorators/current-partner.decorator';

@Injectable()
export class PartnerAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      [TENANT_CONTEXT_KEY]?: TenantContext;
      [PARTNER_AUTH_KEY]?: PartnerAuthPayload;
    }>();

    const token = this.extractBearerToken(request.headers.authorization);
    if (!token) throw new UnauthorizedException('Partner session is required');

    try {
      const payload = await this.jwtService.verifyAsync<PartnerAuthPayload>(token);
      const tenant = request[TENANT_CONTEXT_KEY];
      if (payload.type !== 'partner' || !payload.sub || payload.tenantId !== tenant?.tenantId) {
        throw new UnauthorizedException('Invalid partner session');
      }
      request[PARTNER_AUTH_KEY] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired partner session');
    }
  }

  private extractBearerToken(header: string | string[] | undefined): string | null {
    const value = Array.isArray(header) ? header[0] : header;
    const match = value?.match(/^Bearer\s+(.+)$/i);
    return match?.[1] ?? null;
  }
}

