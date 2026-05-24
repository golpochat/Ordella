import { Injectable } from '@nestjs/common';
import { PromotionsService } from '../integrations/promotions.service';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';

/**
 * Orders-domain promotions facade for lifecycle side effects.
 */
@Injectable()
export class OrderPromotionsService {
  constructor(private readonly promotionsService: PromotionsService) {}

  async voidOnCancel(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
  ): Promise<void> {
    await this.promotionsService.applyPromotions({
      tenant,
      order,
      items,
      lines: [],
      draftTotals: {
        subtotal: order.subtotal,
        discountTotal: '0.00',
        taxTotal: order.tax,
        serviceChargeTotal: '0.00',
        deliveryFee: '0.00',
        grandTotal: order.total,
        promotionIds: [],
        appliedPromotions: [],
      },
      action: 'void',
    });
  }
}
