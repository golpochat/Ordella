import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TENANT_CONTEXT_KEY } from '../../../common/constants/tenant-context-key';
import { TenantContext } from '../../../common/interfaces';
import { AUDITOR_AUTH_KEY } from '../decorators/current-auditor.decorator';
import { AuditorAuthPayload } from '../types/auditor-auth-payload';

@Injectable()
export class AuditorAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      [TENANT_CONTEXT_KEY]?: TenantContext;
      [AUDITOR_AUTH_KEY]?: AuditorAuthPayload;
    }>();

    const token = this.extractBearerToken(request.headers.authorization);
    if (!token) throw new UnauthorizedException('Auditor session is required');

    try {
      const payload = await this.jwtService.verifyAsync<AuditorAuthPayload>(token);
      const tenant = request[TENANT_CONTEXT_KEY];
      if (payload.type !== 'auditor' || !payload.sub || payload.tenantId !== tenant?.tenantId) {
        throw new UnauthorizedException('Invalid auditor session');
      }
      request[AUDITOR_AUTH_KEY] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired auditor session');
    }
  }

  private extractBearerToken(header: string | string[] | undefined): string | null {
    const value = Array.isArray(header) ? header[0] : header;
    const match = value?.match(/^Bearer\s+(.+)$/i);
    return match?.[1] ?? null;
  }
}
