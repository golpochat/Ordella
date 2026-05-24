import { Injectable, Logger } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';

/** Placeholder — applies promotions via PromotionsModule when integrated. */
@Injectable()
export class OrderPromotionHook {
  private readonly logger = new Logger(OrderPromotionHook.name);

  async applyOnOrderCreated(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
  ): Promise<{ discountAmount: string; promotionIds: string[] }> {
    this.logger.debug(
      `[placeholder] apply promotions tenant=${tenant.tenantId} order=${order.id} lines=${items.length}`,
    );
    return { discountAmount: '0.00', promotionIds: [] };
  }

  async voidOnOrderCancelled(tenant: TenantContext, order: OrderEntity): Promise<void> {
    this.logger.debug(
      `[placeholder] void promotions tenant=${tenant.tenantId} order=${order.id}`,
    );
  }
}
