import { Injectable, Logger } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderStatus } from '../enums/order-status.enum';

/** Placeholder — triggers NotificationsModule templates. */
@Injectable()
export class OrderNotificationHook {
  private readonly logger = new Logger(OrderNotificationHook.name);

  async onOrderCreated(tenant: TenantContext, order: OrderEntity): Promise<void> {
    this.logger.debug(
      `[placeholder] notification order.created tenant=${tenant.tenantId} order=${order.id}`,
    );
  }

  async onStatusChanged(
    tenant: TenantContext,
    order: OrderEntity,
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
  ): Promise<void> {
    this.logger.debug(
      `[placeholder] notification order.status tenant=${tenant.tenantId} order=${order.id} ${fromStatus}→${toStatus}`,
    );
  }
}
