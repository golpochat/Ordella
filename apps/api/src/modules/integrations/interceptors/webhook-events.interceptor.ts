import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { TENANT_CONTEXT_KEY } from '../../../common/constants/tenant-context-key';
import { TenantContext } from '../../../common/interfaces';
import { WebhooksService } from '../services';

type RequestWithTenant = Request & { [TENANT_CONTEXT_KEY]?: TenantContext };

@Injectable()
export class WebhookEventsInterceptor implements NestInterceptor {
  constructor(private readonly webhooks: WebhooksService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithTenant>();
    return next.handle().pipe(
      tap({
        next: (response) => {
          const tenantId = request[TENANT_CONTEXT_KEY]?.tenantId;
          const eventType = tenantId ? this.inferEvent(request, response) : null;
          if (!tenantId || !eventType) return;
          void this.webhooks.publish(tenantId, eventType, {
            id: `evt_${Date.now()}`,
            type: eventType,
            tenantId,
            data: (response as { data?: unknown })?.data ?? response,
            createdAt: new Date().toISOString(),
          }).catch(() => undefined);
        },
      }),
    );
  }

  private inferEvent(request: RequestWithTenant, response: unknown): string | null {
    if (!['POST', 'PATCH', 'PUT'].includes(request.method)) return null;
    const path = request.path.toLowerCase();
    const data = (response as { data?: { status?: string; paymentStatus?: string } })?.data;
    if (path.includes('/orders') || path.includes('/pos/complete-sale') || path.includes('/public/payment')) {
      if (data?.status === 'ready') return 'order.ready';
      if (data?.status === 'completed') return 'order.delivered';
      return request.method === 'POST' ? 'order.created' : 'order.updated';
    }
    if (path.includes('/inventory')) return 'inventory.low';
    if (path.includes('/customer')) return request.method === 'POST' ? 'customer.created' : 'customer.updated';
    if (path.includes('/payments')) return path.includes('failed') ? 'payment.failed' : 'payment.succeeded';
    if (path.includes('/products') || path.includes('/catalog')) return 'item.updated';
    return null;
  }
}
