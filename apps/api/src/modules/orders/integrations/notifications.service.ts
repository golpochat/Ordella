import { Injectable, Logger } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';

/** Placeholder for NotificationsModule — no external integration. */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendOrderNotification(
    tenant: TenantContext,
    order: OrderEntity,
    templateKey: string,
    payload: Record<string, unknown> = {},
  ): Promise<void> {
    this.logger.debug(
      `[placeholder] NotificationsService.sendOrderNotification template=${templateKey} tenant=${tenant.tenantId} order=${order.id} payload=${JSON.stringify(payload)}`,
    );
  }
}
