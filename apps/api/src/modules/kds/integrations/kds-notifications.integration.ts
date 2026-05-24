import { Injectable, Logger } from '@nestjs/common';
import { OrderStatus } from '../../orders/enums/order-status.enum';

/** Optional — fulfillment notifications via NotificationsModule */
@Injectable()
export class KdsNotificationsIntegration {
  private readonly logger = new Logger(KdsNotificationsIntegration.name);

  notifyOrderStatus(tenantId: string, orderId: string, status: OrderStatus): void {
    this.logger.debug(
      `[optional] KdsNotificationsIntegration.notify tenant=${tenantId} order=${orderId} status=${status}`,
    );
  }
}
