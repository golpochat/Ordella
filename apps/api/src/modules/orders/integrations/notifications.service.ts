import { Injectable } from '@nestjs/common';
import { NotificationsService as CoreNotificationsService } from '../../notifications/services/notifications.service';
import { NotificationChannelType } from '../../notifications/enums/notification-channel-type.enum';
import { NotificationType } from '../../notifications/enums/notification-type.enum';
import { OrderNotificationType } from '../enums/order-notification-type.enum';
import { OrderNotificationContext } from '../types/order-notification.context';

@Injectable()
export class NotificationsService {
  constructor(private readonly notifications: CoreNotificationsService) {}

  async sendOrderNotification(
    context: OrderNotificationContext,
    eventType: OrderNotificationType,
  ): Promise<void> {
    const templateName = this.templateForEvent(eventType);
    await this.notifications.sendSystemNotification(context.tenant.tenantId, {
      type: NotificationType.ORDER_STATUS,
      channel: NotificationChannelType.PUSH,
      payload: {
        templateName: eventType === OrderNotificationType.ORDER_CREATED ? 'new_order' : templateName,
        orderId: context.order.id,
        orderNumber: context.order.orderNumber ?? context.order.id.slice(0, 8),
        status: context.toStatus,
        previousStatus: context.fromStatus,
        total: context.order.total,
        message: `Order ${context.order.orderNumber ?? context.order.id.slice(0, 8)} changed to ${context.toStatus}`,
      },
    });
  }

  private templateForEvent(eventType: OrderNotificationType): string {
    switch (eventType) {
      case OrderNotificationType.ORDER_READY:
        return 'order_ready';
      case OrderNotificationType.ORDER_OUT_FOR_DELIVERY:
        return 'order_out_for_delivery';
      case OrderNotificationType.ORDER_COMPLETED:
        return 'order_delivered';
      case OrderNotificationType.ORDER_CREATED:
        return 'order_placed';
      default:
        return 'system';
    }
  }
}
