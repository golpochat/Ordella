import { Injectable, Logger } from '@nestjs/common';
import { OrderNotificationType } from '../enums/order-notification-type.enum';
import { OrderNotificationContext } from '../types/order-notification.context';

/** Placeholder for NotificationsModule — no SMS, email, or push providers. */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendOrderNotification(
    context: OrderNotificationContext,
    eventType: OrderNotificationType,
  ): Promise<void> {
    this.logger.debug(
      `[placeholder] NotificationsService.sendOrderNotification event=${eventType} tenant=${context.tenant.tenantId} order=${context.order.id} status=${context.order.status} ${context.fromStatus}→${context.toStatus}`,
    );
  }
}
