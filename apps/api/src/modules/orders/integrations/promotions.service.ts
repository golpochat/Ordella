import { Injectable } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { AppliedPromotion, CalculatedLineItem, DraftOrderTotals } from '../types/draft-order.types';
import { PromotionsService as PromotionsCoreService } from '../../promotions/services/promotions.service';

export interface ApplyPromotionsInput {
  tenant: TenantContext;
  order?: OrderEntity;
  items: OrderItemEntity[];
  lines: CalculatedLineItem[];
  draftTotals: DraftOrderTotals;
  action?: 'apply' | 'void';
  couponCode?: string;
  locationId?: string;
  orderType?: string;
}

export interface ApplyPromotionsResult {
  discountTotal: string;
  promotionIds: string[];
  appliedPromotions: AppliedPromotion[];
  grandTotal: string;
}

@Injectable()
export class PromotionsService {
  constructor(private readonly promotionsCore: PromotionsCoreService) {}

  async applyPromotions(input: ApplyPromotionsInput): Promise<ApplyPromotionsResult> {
    const { tenant, order, lines, draftTotals, action = 'apply' } = input;

    if (action === 'void') {
      return {
        discountTotal: '0.00',
        promotionIds: [],
        appliedPromotions: [],
        grandTotal: draftTotals.grandTotal,
      };
    }

    return this.promotionsCore.applyPromotions({
      tenantId: tenant.tenantId,
      orderId: order?.id ?? null,
      customerId: order?.customerId ?? null,
      couponCode: input.couponCode ?? null,
      locationId: input.locationId ?? order?.locationId ?? null,
      channel: this.resolveChannel(input.orderType ?? order?.orderType),
      orderType: input.orderType ?? order?.orderType ?? null,
      subtotal: draftTotals.subtotal,
      taxTotal: draftTotals.taxTotal,
      deliveryFee: draftTotals.deliveryFee,
      serviceChargeTotal: draftTotals.serviceChargeTotal,
      lines: lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        lineSubtotal: line.lineSubtotal,
        categoryId: line.categoryId,
      })),
      action,
    });
  }

  private resolveChannel(orderType?: string | null): 'pos' | 'online' | 'both' {
    if (orderType === 'pos') return 'pos';
    if (orderType === 'online' || orderType === 'pickup' || orderType === 'delivery') return 'online';
    return 'both';
  }
}
