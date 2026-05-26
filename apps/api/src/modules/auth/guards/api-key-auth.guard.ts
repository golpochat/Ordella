import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { TENANT_CONTEXT_KEY } from '../../../common/constants/tenant-context-key';
import { RateLimitService } from '../../../platform/security/rate-limit.service';
import { AuditLogEntity } from '../../audit/entities';
import { ApiKeyUsageLogEntity } from '../entities';
import { API_KEY_CONTEXT_KEY } from '../decorators/current-api-key.decorator';
import { API_KEY_SCOPES_KEY } from '../decorators/require-api-key-scopes.decorator';
import { ApiKeysService, VerifiedApiKey } from '../services/api-keys.service';

type ApiKeyRequest = Request & {
  [TENANT_CONTEXT_KEY]?: { tenantId: string; source: 'api_key' };
  [API_KEY_CONTEXT_KEY]?: VerifiedApiKey;
};

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    private readonly apiKeys: ApiKeysService,
    private readonly rateLimit: RateLimitService,
    private readonly reflector: Reflector,
    @InjectRepository(AuditLogEntity)
    private readonly auditLogs: Repository<AuditLogEntity>,
    @InjectRepository(ApiKeyUsageLogEntity)
    private readonly usageLogs: Repository<ApiKeyUsageLogEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ApiKeyRequest>();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('API key is required');

    const apiKey = await this.apiKeys.verify(token);
    const ipAddress = this.extractIpAddress(request);
    if (apiKey.ipAllowlist.length && (!ipAddress || !apiKey.ipAllowlist.includes(ipAddress))) {
      await this.logUsage(request, apiKey, 403, { reason: 'ip_not_allowed' });
      throw new ForbiddenException('API key IP is not allowed');
    }
    const rate = await this.rateLimit.check(`rl:api-key:${apiKey.id}`, apiKey.rateLimitPerMinute, 60);
    if (!rate.allowed) throw new HttpException('API key rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);

    const required = this.reflector.getAllAndOverride<string[]>(API_KEY_SCOPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [];
    if (!this.scopesAllowed(apiKey.scopes, required)) {
      throw new ForbiddenException('API key scope is not allowed');
    }

    request[TENANT_CONTEXT_KEY] = { tenantId: apiKey.tenantId, source: 'api_key' };
    request[API_KEY_CONTEXT_KEY] = apiKey;
    await this.logUsage(request, apiKey, 200);
    return true;
  }

  private extractToken(request: ApiKeyRequest): string | null {
    const auth = request.headers.authorization;
    const header = Array.isArray(auth) ? auth[0] : auth;
    const bearer = header?.match(/^Bearer\s+(.+)$/i)?.[1];
    const apiKey = request.headers['x-api-key'];
    return bearer ?? (Array.isArray(apiKey) ? apiKey[0] : apiKey) ?? null;
  }

  private scopesAllowed(actual: string[], required: string[]): boolean {
    return actual.includes('*') || required.every((scope) => actual.includes(scope));
  }

  private extractIpAddress(request: ApiKeyRequest): string | null {
    const forwardedFor = request.headers['x-forwarded-for'];
    return (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0]?.trim() : null) ?? request.ip ?? null;
  }

  private async logUsage(request: ApiKeyRequest, apiKey: VerifiedApiKey, statusCode: number, metadata: Record<string, unknown> = {}): Promise<void> {
    const ipAddress = this.extractIpAddress(request);
    const userAgent = request.headers['user-agent'];
    await this.usageLogs.save(this.usageLogs.create({
      tenantId: apiKey.tenantId,
      apiKeyId: apiKey.id,
      method: request.method,
      path: request.path,
      statusCode,
      ipAddress,
      userAgent: Array.isArray(userAgent) ? userAgent[0] ?? null : userAgent ?? null,
      rateLimitPerMinute: apiKey.rateLimitPerMinute,
      metadata,
    }));
    await this.auditLogs.save(
      this.auditLogs.create({
        tenantId: apiKey.tenantId,
        userId: null,
        locationId: null,
        action: 'api_key.used',
        entityType: 'api_key',
        entityId: apiKey.id,
        ipAddress,
        userAgent: Array.isArray(userAgent) ? userAgent[0] ?? null : userAgent ?? null,
        metadata: {
          keyPrefix: apiKey.keyPrefix,
          keyName: apiKey.name,
          method: request.method,
          path: request.path,
          scopes: apiKey.scopes,
          statusCode,
          rateLimitPerMinute: apiKey.rateLimitPerMinute,
          ...metadata,
        },
      }),
    );
  }
}
