import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TENANT_CONTEXT_KEY } from '../../../common/constants/tenant-context-key';
import { TenantContext } from '../../../common/interfaces';
import { CUSTOMER_AUTH_KEY } from '../decorators/current-customer.decorator';
import { CustomerSessionEntity } from '../entities';
import { CustomerAuthPayload } from '../types/customer-auth-payload';

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(CustomerSessionEntity)
    private readonly sessions: Repository<CustomerSessionEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      [TENANT_CONTEXT_KEY]?: TenantContext;
      [CUSTOMER_AUTH_KEY]?: CustomerAuthPayload;
    }>();
    const token = this.extractBearerToken(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException('Customer session is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<CustomerAuthPayload>(token);
      const tenant = request[TENANT_CONTEXT_KEY];
      if (payload.type !== 'customer' || !payload.sub || payload.tenantId !== tenant?.tenantId) {
        throw new UnauthorizedException('Invalid customer session');
      }
      if (payload.sessionId) {
        const session = await this.sessions.findOne({
          where: { id: payload.sessionId, tenantId: payload.tenantId, customerId: payload.sub },
        });
        if (!session || session.revokedAt) {
          throw new UnauthorizedException('Customer session has been revoked');
        }
        session.lastSeenAt = new Date();
        await this.sessions.save(session);
      }
      request[CUSTOMER_AUTH_KEY] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired customer session');
    }
  }

  private extractBearerToken(header: string | string[] | undefined): string | null {
    const value = Array.isArray(header) ? header[0] : header;
    const match = value?.match(/^Bearer\s+(.+)$/i);
    return match?.[1] ?? null;
  }
}
