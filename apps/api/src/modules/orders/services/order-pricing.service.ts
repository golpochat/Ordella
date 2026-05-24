import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { VariantEntity } from '../../catalog/entities/variant.entity';
import { DEFAULT_ORDER_TAX_RATE } from '../constants/order-tax.constants';
import {
  calculateOrderTotals as computeTotalsFromLines,
  formatMoney,
  OrderTotals,
} from '../domain/order-totals.util';
import { CalculatedLineItem, DraftOrderTotals } from '../types/draft-order.types';
import { CreateOrderNestedItemDto } from '../dto/orders/create-order-nested-item.dto';

export interface CalculateOrderTotalsOptions {
  taxRate?: number;
  discountAmount?: string;
}

@Injectable()
export class OrderPricingService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(VariantEntity)
    private readonly variantRepository: Repository<VariantEntity>,
  ) {}

  async calculateLineItem(
    tenant: TenantContext,
    productId: string,
    quantity: number,
    variantId?: string | null,
    notes?: string | null,
  ): Promise<CalculatedLineItem> {
    const unitPrice = await this.resolveUnitPrice(tenant, productId, variantId);
    const lineSubtotal = formatMoney(Number(unitPrice) * quantity);

    return {
      productId,
      variantId: variantId ?? null,
      quantity,
      unitPrice,
      lineSubtotal,
      notes: notes ?? null,
    };
  }

  async calculateLineItemsFromDto(
    tenant: TenantContext,
    items: CreateOrderNestedItemDto[],
  ): Promise<CalculatedLineItem[]> {
    return Promise.all(
      items.map((item) =>
        this.calculateLineItem(
          tenant,
          item.productId,
          item.quantity,
          item.variantId,
          item.notes,
        ),
      ),
    );
  }

  calculateOrderTotals(
    lines: CalculatedLineItem[],
    options: CalculateOrderTotalsOptions = {},
  ): DraftOrderTotals {
    const taxRate = options.taxRate ?? DEFAULT_ORDER_TAX_RATE;
    const base: OrderTotals = computeTotalsFromLines(
      lines.map((line) => ({ quantity: line.quantity, price: line.unitPrice })),
      taxRate,
    );
    const discountAmount = options.discountAmount ?? '0.00';
    const adjustedTotal = Math.max(0, Number(base.total) - Number(discountAmount));

    return {
      ...base,
      discountAmount,
      promotionIds: [],
      total: formatMoney(adjustedTotal),
    };
  }

  applyDiscountToDraft(
    draft: DraftOrderTotals,
    discountAmount: string,
    promotionIds: string[],
  ): DraftOrderTotals {
    const adjustedTotal = Math.max(0, Number(draft.total) - Number(discountAmount));
    return {
      subtotal: draft.subtotal,
      tax: draft.tax,
      total: formatMoney(adjustedTotal),
      discountAmount,
      promotionIds,
    };
  }

  private async resolveUnitPrice(
    tenant: TenantContext,
    productId: string,
    variantId?: string | null,
  ): Promise<string> {
    const product = await this.productRepository.findOne({
      where: { id: productId, tenantId: tenant.tenantId },
    });
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    let unitAmount = Number(product.price);

    if (variantId) {
      const variant = await this.variantRepository.findOne({
        where: { id: variantId, productId: product.id },
      });
      if (!variant) {
        throw new NotFoundException(`Variant ${variantId} not found for product`);
      }
      unitAmount += Number(variant.priceDelta);
    }

    return formatMoney(unitAmount);
  }
}
