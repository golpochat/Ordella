import { Injectable } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderNotificationType } from '../enums/order-notification-type.enum';
import { orderStatusToNotificationType } from '../domain/order-notification-type.mapper';
import { NotificationsService } from '../integrations/notifications.service';
import { OrderNotificationContext } from '../types/order-notification.context';

/** Orders-domain notification orchestration — delegates to NotificationsModule placeholders. */
@Injectable()
export class OrderNotificationService {
  constructor(private readonly notificationsService: NotificationsService) {}

  buildContext(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    fromStatus: OrderStatus | null,
    toStatus: OrderStatus,
    eventType: OrderNotificationType,
  ): OrderNotificationContext {
    return { tenant, order, items, fromStatus, toStatus, eventType };
  }

  async notifyForStatus(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    fromStatus: OrderStatus | null,
    toStatus: OrderStatus,
  ): Promise<void> {
    const eventType = orderStatusToNotificationType(toStatus);
    if (!eventType) {
      return;
    }

    const context = this.buildContext(tenant, order, items, fromStatus, toStatus, eventType);
    await this.notificationsService.sendOrderNotification(context, eventType);
  }

  async notify(
    context: OrderNotificationContext,
    eventType: OrderNotificationType,
  ): Promise<void> {
    await this.notificationsService.sendOrderNotification(context, eventType);
  }
}
