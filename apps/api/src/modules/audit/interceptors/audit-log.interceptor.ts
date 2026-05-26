import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { TENANT_CONTEXT_KEY } from '../../../common/constants/tenant-context-key';
import { CURRENT_USER_KEY } from '../../../common/decorators/current-user.decorator';
import { TenantContext, AuthenticatedUser } from '../../../common/interfaces';
import { PERMISSIONS_KEY } from '../../auth/decorators';
import { CUSTOMER_AUTH_KEY } from '../../customer-accounts/decorators/current-customer.decorator';
import { CustomerAuthPayload } from '../../customer-accounts/types/customer-auth-payload';
import { AuditLogService } from '../services';

type RequestWithAuditContext = Request & {
  [TENANT_CONTEXT_KEY]?: TenantContext;
  [CURRENT_USER_KEY]?: AuthenticatedUser;
  [CUSTOMER_AUTH_KEY]?: CustomerAuthPayload;
};

const MUTATION_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);
const REDACTED = '[redacted]';
const SENSITIVE_KEYS = ['authorization', 'password', 'passwordHash', 'token', 'refreshToken', 'secret', 'pin'];

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly auditLogs: AuditLogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithAuditContext>();
    if (!this.shouldAudit(request)) {
      return next.handle();
    }

    const base = this.buildBaseContext(context, request);
    return next.handle().pipe(
      tap({
        next: (response) => {
          void this.recordSafe({
            ...base,
            action: this.inferAction(request, false),
            status: 'success',
            riskLevel: this.inferRisk(request),
            entityId: this.inferEntityId(request, response),
            metadata: {
              ...base.metadata,
              response: this.summarizeResponse(response),
            },
          });
        },
        error: (error: Error) => {
          void this.recordSafe({
            ...base,
            action: this.inferAction(request, true),
            status: 'failed',
            riskLevel: 'high',
            metadata: {
              ...base.metadata,
              error: {
                name: error.name,
                message: error.message,
              },
            },
          });
        },
      }),
    );
  }

  private shouldAudit(request: RequestWithAuditContext): boolean {
    return Boolean(request[TENANT_CONTEXT_KEY]?.tenantId && MUTATION_METHODS.has(request.method));
  }

  private buildBaseContext(context: ExecutionContext, request: RequestWithAuditContext) {
    const tenant = request[TENANT_CONTEXT_KEY]!;
    const user = request[CURRENT_USER_KEY];
    const customer = request[CUSTOMER_AUTH_KEY];
    const permissions =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    return {
      tenantId: tenant.tenantId,
      userId: user?.id ?? customer?.sub ?? null,
      locationId: this.findLocationId(request),
      actorType: user ? 'staff' : customer ? 'customer' : 'system',
      source: this.inferSource(request),
      requestId: this.extractRequestId(request),
      entityType: this.inferEntityType(request),
      entityId: this.inferEntityId(request, undefined),
      ipAddress: this.extractIpAddress(request),
      userAgent: this.extractUserAgent(request),
      metadata: {
        method: request.method,
        path: request.path,
        params: this.sanitize(request.params),
        query: this.sanitize(request.query),
        body: this.sanitize(request.body),
        actorType: user ? 'staff' : customer ? 'customer' : 'system',
        permissions,
      },
    };
  }

  private async recordSafe(input: Parameters<AuditLogService['record']>[0]): Promise<void> {
    try {
      await this.auditLogs.record(input);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown audit log failure';
      this.logger.warn(`Failed to write audit log: ${message}`);
    }
  }

  private inferAction(request: RequestWithAuditContext, failed: boolean): string {
    const entityType = this.inferEntityType(request);
    if (failed) return `${entityType}.failed`;

    const path = request.path.toLowerCase();
    if (path.includes('/status')) return `${entityType}.status_changed`;
    if (path.includes('/login')) return failed ? 'login.failed' : 'login.succeeded';
    if (path.includes('/logout')) return 'logout.succeeded';
    if (path.includes('/reset-password')) return `${entityType}.password_reset`;
    if (path.includes('/permissions') || path.includes('/roles')) return `${entityType}.permission_changed`;
    if (path.includes('/webhook')) return `${entityType}.webhook`;
    if (path.includes('/refund')) return `${entityType}.refunded`;
    if (path.includes('/redeem')) return `${entityType}.redeemed`;
    if (path.includes('/adjust')) return `${entityType}.adjusted`;
    if (path.includes('/disable')) return `${entityType}.disabled`;
    if (path.includes('/assign')) return `${entityType}.assigned`;

    if (request.method === 'POST') return `${entityType}.created`;
    if (request.method === 'PATCH' || request.method === 'PUT') return `${entityType}.updated`;
    if (request.method === 'DELETE') return `${entityType}.deleted`;
    return `${entityType}.changed`;
  }

  private inferEntityType(request: RequestWithAuditContext): string {
    const segments = request.path
      .replace(/^\/api\/v\d+\//, '')
      .split('/')
      .filter(Boolean);
    const candidates = segments.filter((segment) => !this.looksLikeUuid(segment));
    const first = candidates[0] ?? 'system';
    const second = candidates[1];

    if (first === 'admin' && second) return this.singularize(second);
    if (first === 'public' && second === 'customer') return 'customer';
    if (first === 'customer') return 'customer';
    if (first === 'payments') return 'payment';
    if (first === 'giftcards') return 'gift_card';
    if (first === 'storecredit') return 'store_credit';
    return this.singularize(first);
  }

  private inferEntityId(request: RequestWithAuditContext, response: unknown): string | null {
    const params = request.params as Record<string, unknown>;
    const body = request.body as Record<string, unknown> | undefined;
    const responseData = this.extractResponseData(response);
    const candidates = [
      params.id,
      params.orderId,
      params.customerId,
      params.locationId,
      params.productId,
      params.categoryId,
      body?.id,
      body?.orderId,
      body?.customerId,
      responseData?.id,
      responseData?.orderId,
      responseData?.customerId,
    ];
    const found = candidates.find((value) => typeof value === 'string' && value.length > 0);
    return typeof found === 'string' ? found : null;
  }

  private findLocationId(request: RequestWithAuditContext): string | null {
    const params = request.params as Record<string, unknown>;
    const body = request.body as Record<string, unknown> | undefined;
    const query = request.query as Record<string, unknown>;
    const value = body?.locationId ?? params.locationId ?? query.locationId;
    return typeof value === 'string' && this.looksLikeUuid(value) ? value : null;
  }

  private extractIpAddress(request: RequestWithAuditContext): string | null {
    const forwardedFor = request.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string') return forwardedFor.split(',')[0]?.trim() || null;
    if (Array.isArray(forwardedFor)) return forwardedFor[0]?.split(',')[0]?.trim() || null;
    return request.ip ?? null;
  }

  private extractRequestId(request: RequestWithAuditContext): string | null {
    const requestId = request.headers['x-request-id'] ?? request.headers['x-correlation-id'];
    if (typeof requestId === 'string') return requestId;
    if (Array.isArray(requestId)) return requestId[0] ?? null;
    return null;
  }

  private inferSource(request: RequestWithAuditContext): string {
    const path = request.path.toLowerCase();
    if (path.includes('/webhook')) return 'webhook';
    if (path.includes('/public/customer')) return 'customer_portal';
    if (path.includes('/public')) return 'storefront';
    return 'admin_api';
  }

  private inferRisk(request: RequestWithAuditContext): string {
    const path = request.path.toLowerCase();
    if (request.method === 'DELETE') return 'high';
    if (path.includes('/permissions') || path.includes('/roles') || path.includes('/api-keys')) return 'high';
    if (path.includes('/refund') || path.includes('/billing') || path.includes('/webhook') || path.includes('/gdpr')) return 'medium';
    return 'low';
  }

  private extractUserAgent(request: RequestWithAuditContext): string | null {
    const userAgent = request.headers['user-agent'];
    return Array.isArray(userAgent) ? userAgent[0] ?? null : userAgent ?? null;
  }

  private sanitize(value: unknown): unknown {
    if (Array.isArray(value)) return value.map((item) => this.sanitize(item));
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        this.isSensitiveKey(key) ? REDACTED : this.sanitize(entry),
      ]),
    );
  }

  private isSensitiveKey(key: string): boolean {
    const normalized = key.toLowerCase();
    return SENSITIVE_KEYS.some((sensitive) => normalized.includes(sensitive.toLowerCase()));
  }

  private summarizeResponse(response: unknown): Record<string, unknown> | null {
    const data = this.extractResponseData(response);
    if (!data) return null;
    return this.sanitize({
      id: data.id,
      orderId: data.orderId,
      customerId: data.customerId,
      status: data.status,
      orderStatus: data.orderStatus,
      paymentStatus: data.paymentStatus,
      total: data.total,
    }) as Record<string, unknown>;
  }

  private extractResponseData(response: unknown): Record<string, unknown> | null {
    if (!response || typeof response !== 'object') return null;
    const maybeData = (response as { data?: unknown }).data;
    if (maybeData && typeof maybeData === 'object' && !Array.isArray(maybeData)) {
      return maybeData as Record<string, unknown>;
    }
    return response as Record<string, unknown>;
  }

  private singularize(value: string): string {
    if (value.endsWith('ies')) return `${value.slice(0, -3)}y`;
    if (value.endsWith('s')) return value.slice(0, -1);
    return value;
  }

  private looksLikeUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }
}
