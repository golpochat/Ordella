import { Injectable, Logger } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderType } from '../enums/order-type.enum';

/** Placeholder — assigns delivery tasks via DeliveriesModule when integrated. */
@Injectable()
export class OrderDeliveryHook {
  private readonly logger = new Logger(OrderDeliveryHook.name);

  async assignForOrder(tenant: TenantContext, order: OrderEntity): Promise<void> {
    if (order.orderType !== OrderType.DELIVERY) {
      return;
    }
    this.logger.debug(
      `[placeholder] assign delivery tenant=${tenant.tenantId} order=${order.id}`,
    );
  }
}
