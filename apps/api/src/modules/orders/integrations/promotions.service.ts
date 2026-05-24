import { Injectable, Logger } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { DraftOrderTotals } from '../types/draft-order.types';

export interface ApplyPromotionsInput {
  tenant: TenantContext;
  order?: OrderEntity;
  items: OrderItemEntity[];
  draftTotals: DraftOrderTotals;
  action?: 'apply' | 'void';
}

export interface ApplyPromotionsResult {
  discountAmount: string;
  promotionIds: string[];
  adjustedTotal: string;
}

/** Placeholder for PromotionsModule — no external integration. */
@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  async applyPromotions(input: ApplyPromotionsInput): Promise<ApplyPromotionsResult> {
    const { tenant, order, items, draftTotals, action = 'apply' } = input;

    if (action === 'void') {
      this.logger.debug(
        `[placeholder] PromotionsService.applyPromotions void tenant=${tenant.tenantId} order=${order?.id}`,
      );
      return {
        discountAmount: '0.00',
        promotionIds: [],
        adjustedTotal: draftTotals.total,
      };
    }

    this.logger.debug(
      `[placeholder] PromotionsService.applyPromotions tenant=${tenant.tenantId} order=${order?.id ?? 'draft'} lines=${items.length} subtotal=${draftTotals.subtotal}`,
    );

    return {
      discountAmount: '0.00',
      promotionIds: [],
      adjustedTotal: draftTotals.total,
    };
  }
}
