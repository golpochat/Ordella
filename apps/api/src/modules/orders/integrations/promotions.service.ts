import { Injectable, Logger } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { AppliedPromotion, CalculatedLineItem, DraftOrderTotals } from '../types/draft-order.types';

export interface ApplyPromotionsInput {
  tenant: TenantContext;
  order?: OrderEntity;
  items: OrderItemEntity[];
  lines: CalculatedLineItem[];
  draftTotals: DraftOrderTotals;
  action?: 'apply' | 'void';
}

export interface ApplyPromotionsResult {
  discountTotal: string;
  promotionIds: string[];
  appliedPromotions: AppliedPromotion[];
  grandTotal: string;
}

/** Placeholder for PromotionsModule — no external integration. */
@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  async applyPromotions(input: ApplyPromotionsInput): Promise<ApplyPromotionsResult> {
    const { tenant, order, items, lines, draftTotals, action = 'apply' } = input;

    if (action === 'void') {
      this.logger.debug(
        `[placeholder] PromotionsService.applyPromotions void tenant=${tenant.tenantId} order=${order?.id}`,
      );
      return {
        discountTotal: '0.00',
        promotionIds: [],
        appliedPromotions: [],
        grandTotal: draftTotals.grandTotal,
      };
    }

    this.logger.debug(
      `[placeholder] PromotionsService.applyPromotions tenant=${tenant.tenantId} order=${order?.id ?? 'draft'} lines=${lines.length} items=${items.length} subtotal=${draftTotals.subtotal}`,
    );

    return {
      discountTotal: '0.00',
      promotionIds: [],
      appliedPromotions: [],
      grandTotal: draftTotals.grandTotal,
    };
  }
}
