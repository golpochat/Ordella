import { Injectable, NotFoundException } from '@nestjs/common';
import { assertValidLineQuantity } from '../domain/order-lifecycle.validation';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { VariantEntity } from '../../catalog/entities/variant.entity';
import { ModifierOptionEntity } from '../../catalog/entities/modifier-option.entity';
import { BundleEntity, BundlePriceType } from '../../bundles/entities';
import {
  calculateGrandTotal,
  formatMoney,
  parseMoney,
  sumMoney,
} from '../domain/order-totals.util';
import {
  CalculatedLineItem,
  DraftOrderTotals,
  LineItemModifierSelection,
} from '../types/draft-order.types';
import { OrderPricingContext } from '../types/order-pricing.context';
import { CreateOrderNestedItemDto } from '../dto/orders/create-order-nested-item.dto';
import { OrderFeeCalculatorService } from '../pricing/order-fee-calculator.service';
import { PromotionsService, ApplyPromotionsResult } from '../integrations/promotions.service';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';

export interface CalculateLineItemInput {
  productId: string;
  quantity: number;
  variantId?: string | null;
  modifierOptionIds?: string[];
  notes?: string | null;
  bundleId?: string | null;
  priceOverride?: number;
}

@Injectable()
export class OrderPricingService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(VariantEntity)
    private readonly variantRepository: Repository<VariantEntity>,
    @InjectRepository(ModifierOptionEntity)
    private readonly modifierOptionRepository: Repository<ModifierOptionEntity>,
    @InjectRepository(BundleEntity)
    private readonly bundleRepository: Repository<BundleEntity>,
    private readonly feeCalculator: OrderFeeCalculatorService,
    private readonly promotionsService: PromotionsService,
  ) {}

  async calculateLineItem(
    tenant: TenantContext,
    input: CalculateLineItemInput,
    pricingContext: OrderPricingContext,
  ): Promise<CalculatedLineItem> {
    const { productId, quantity, variantId, modifierOptionIds = [], notes } = input;

    assertValidLineQuantity(quantity);

    const product = await this.resolveProduct(tenant, productId);
    const priceOverride = input.priceOverride;
    const hasPriceOverride = priceOverride !== undefined;
    const unitPrice = hasPriceOverride
      ? formatMoney(priceOverride)
      : await this.resolveUnitPriceForProduct(product, variantId);
    const modifiers = await this.resolveModifierSelections(modifierOptionIds);
    const modifierTotal = hasPriceOverride
      ? formatMoney(0)
      : formatMoney(sumMoney(modifiers.map((m) => m.priceDelta)));
    const unitPriceWithModifiers = hasPriceOverride
      ? unitPrice
      : formatMoney(parseMoney(unitPrice) + parseMoney(modifierTotal));
    const lineSubtotal = formatMoney(parseMoney(unitPriceWithModifiers) * quantity);

    const lineTax = this.feeCalculator.calculateLineTax(
      parseMoney(lineSubtotal),
      pricingContext,
    );
    const lineDiscount = formatMoney(0);

    return {
      productId,
      categoryId: product.categoryId,
      taxCategoryId: product.taxCategoryId,
      variantId: variantId ?? null,
      bundleId: input.bundleId ?? null,
      quantity,
      unitPrice,
      modifierTotal,
      unitPriceWithModifiers,
      lineSubtotal,
      lineTax,
      lineDiscount,
      notes: notes ?? null,
      modifiers,
    };
  }

  async calculateLineItemsFromDto(
    tenant: TenantContext,
    items: CreateOrderNestedItemDto[],
    pricingContext: OrderPricingContext,
  ): Promise<CalculatedLineItem[]> {
    const lines: CalculatedLineItem[] = [];
    for (const item of items) {
      if (item.bundleId) {
        lines.push(...await this.calculateBundleLines(tenant, item, pricingContext));
        continue;
      }
      lines.push(await this.calculateLineItem(
        tenant,
        {
          productId: item.productId,
          quantity: item.quantity,
          variantId: item.variantId,
          modifierOptionIds: item.modifierOptionIds,
          notes: item.notes,
          priceOverride: item.priceOverride,
        },
        pricingContext,
      ));
    }
    return lines;
  }

  private async calculateBundleLines(
    tenant: TenantContext,
    item: CreateOrderNestedItemDto,
    pricingContext: OrderPricingContext,
  ): Promise<CalculatedLineItem[]> {
    const bundle = await this.bundleRepository.findOne({
      where: { id: item.bundleId, tenantId: tenant.tenantId, isActive: true },
      relations: { items: true },
    });
    if (!bundle) throw new NotFoundException(`Bundle ${item.bundleId} not found`);
    const selected = new Set(item.selectedBundleItemIds ?? []);
    const rows = bundle.items.filter(
      (bundleItem) =>
        !bundleItem.isOptional ||
        !item.selectedBundleItemIds ||
        selected.has(bundleItem.itemId),
    );
    const lines = await Promise.all(rows.map((bundleItem) =>
      this.calculateLineItem(tenant, {
        productId: bundleItem.itemId,
        quantity: bundleItem.quantity * item.quantity,
        notes: item.notes ?? `Bundle: ${bundle.name}`,
        bundleId: bundle.id,
      }, pricingContext),
    ));
    return this.applyBundlePricing(bundle, lines, item.quantity);
  }

  private applyBundlePricing(
    bundle: BundleEntity,
    lines: CalculatedLineItem[],
    bundleQuantity: number,
  ): CalculatedLineItem[] {
    const rawSubtotal = sumMoney(lines.map((line) => line.lineSubtotal));
    if (rawSubtotal <= 0 || bundle.priceType === BundlePriceType.DYNAMIC) return lines;

    if (bundle.priceType === BundlePriceType.FIXED && bundle.fixedPrice) {
      const target = parseMoney(bundle.fixedPrice) * bundleQuantity;
      return lines.map((line) => {
        const share = parseMoney(line.lineSubtotal) / rawSubtotal;
        const lineSubtotal = formatMoney(target * share);
        const unit = formatMoney(parseMoney(lineSubtotal) / line.quantity);
        return {
          ...line,
          unitPrice: unit,
          modifierTotal: formatMoney(0),
          unitPriceWithModifiers: unit,
          lineSubtotal,
          lineDiscount: formatMoney(0),
        };
      });
    }

    const discountAmount = bundle.discountAmount
      ? parseMoney(bundle.discountAmount) * bundleQuantity
      : bundle.discountPercent
        ? rawSubtotal * (parseMoney(bundle.discountPercent) / 100)
        : 0;
    return lines.map((line) => ({
      ...line,
      lineDiscount: formatMoney(discountAmount * (parseMoney(line.lineSubtotal) / rawSubtotal)),
    }));
  }

  calculateOrderTotals(
    lines: CalculatedLineItem[],
    context: OrderPricingContext,
    options: { discountTotal?: string } = {},
  ): DraftOrderTotals {
    const subtotal = formatMoney(sumMoney(lines.map((line) => line.lineSubtotal)));
    const lineDiscountTotal = sumMoney(lines.map((line) => line.lineDiscount));
    const discountTotal = formatMoney(
      parseMoney(options.discountTotal ?? '0.00') + lineDiscountTotal,
    );

    const taxableSubtotal = Math.max(0, parseMoney(subtotal) - parseMoney(discountTotal));
    const taxTotal = this.feeCalculator.calculateTax({
      taxableSubtotal,
      context,
    });
    const serviceChargeTotal = this.feeCalculator.calculateServiceCharge({
      subtotal: parseMoney(subtotal),
      context,
    });
    const deliveryFee = this.feeCalculator.calculateDeliveryFee({ context });

    const grandTotal = calculateGrandTotal({
      subtotal: parseMoney(subtotal),
      discountTotal: parseMoney(discountTotal),
      taxTotal: parseMoney(taxTotal),
      serviceChargeTotal: parseMoney(serviceChargeTotal),
      deliveryFee: parseMoney(deliveryFee),
    });

    return {
      subtotal,
      discountTotal,
      taxTotal,
      serviceChargeTotal,
      deliveryFee,
      grandTotal,
      promotionIds: [],
      appliedPromotions: [],
    };
  }

  /**
   * Applies promotions to a draft and recalculates tax + grand total.
   */
  async applyPromotionsAndRecalculate(
    context: OrderPricingContext,
    draft: DraftOrderTotals,
    lines: CalculatedLineItem[],
    items: OrderItemEntity[],
    order?: OrderEntity,
    couponCode?: string,
  ): Promise<DraftOrderTotals> {
    const promotionResult = await this.promotionsService.applyPromotions({
      tenant: context.tenant,
      order,
      items,
      lines,
      draftTotals: draft,
      action: 'apply',
      couponCode,
      locationId: context.locationId,
      orderType: context.orderType,
    });

    return this.mergePromotionResult(draft, promotionResult, context, lines);
  }

  mergePromotionResult(
    draft: DraftOrderTotals,
    promotionResult: ApplyPromotionsResult,
    context: OrderPricingContext,
    lines: CalculatedLineItem[],
  ): DraftOrderTotals {
    const lineDiscountTotal = sumMoney(lines.map((line) => line.lineDiscount));
    const discountTotal = formatMoney(
      parseMoney(draft.discountTotal) + parseMoney(promotionResult.discountTotal) + lineDiscountTotal,
    );

    const taxableSubtotal = Math.max(
      0,
      parseMoney(draft.subtotal) - parseMoney(discountTotal),
    );
    const taxTotal = this.feeCalculator.calculateTax({
      taxableSubtotal,
      context,
    });

    const grandTotal = calculateGrandTotal({
      subtotal: parseMoney(draft.subtotal),
      discountTotal: parseMoney(discountTotal),
      taxTotal: parseMoney(taxTotal),
      serviceChargeTotal: parseMoney(draft.serviceChargeTotal),
      deliveryFee: parseMoney(draft.deliveryFee),
    });

    return {
      subtotal: draft.subtotal,
      discountTotal,
      taxTotal,
      serviceChargeTotal: draft.serviceChargeTotal,
      deliveryFee: draft.deliveryFee,
      grandTotal,
      promotionIds: promotionResult.promotionIds,
      appliedPromotions: promotionResult.appliedPromotions,
    };
  }

  buildPricingContext(
    tenant: TenantContext,
    locationId: string,
    orderType: OrderPricingContext['orderType'],
    deliveryFeeOverride?: string,
  ): OrderPricingContext {
    return { tenant, locationId, orderType, deliveryFeeOverride };
  }

  private async resolveModifierSelections(
    modifierOptionIds: string[],
  ): Promise<LineItemModifierSelection[]> {
    if (modifierOptionIds.length === 0) {
      return [];
    }

    const options = await this.modifierOptionRepository.find({
      where: { id: In(modifierOptionIds) },
    });

    if (options.length !== modifierOptionIds.length) {
      const found = new Set(options.map((o) => o.id));
      const missing = modifierOptionIds.filter((id) => !found.has(id));
      throw new NotFoundException(
        `Modifier option(s) not found: ${missing.join(', ')}`,
      );
    }

    return options.map((option) => ({
      modifierOptionId: option.id,
      name: option.name,
      priceDelta: formatMoney(parseMoney(option.priceDelta)),
    }));
  }

  private async resolveProduct(
    tenant: TenantContext,
    productId: string,
  ): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { id: productId, tenantId: tenant.tenantId },
    });
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }
    return product;
  }

  private async resolveUnitPriceForProduct(
    product: ProductEntity,
    variantId?: string | null,
  ): Promise<string> {
    let unitAmount = parseMoney(product.price);

    if (variantId) {
      const variant = await this.variantRepository.findOne({
        where: { id: variantId, productId: product.id },
      });
      if (!variant) {
        throw new NotFoundException(`Variant ${variantId} not found for product`);
      }
      unitAmount += parseMoney(variant.priceDelta);
    }

    return formatMoney(unitAmount);
  }
}
