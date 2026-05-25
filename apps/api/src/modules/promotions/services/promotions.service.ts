import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { PromotionEntity } from '../entities/promotion.entity';
import { PromotionConditionEntity } from '../entities/promotion-condition.entity';
import { PromotionActionEntity } from '../entities/promotion-action.entity';
import { PromotionType } from '../enums/promotion-type.enum';
import { RuleType } from '../enums/rule-type.enum';
import { ActionType } from '../enums/action-type.enum';
import { parseAmount, formatAmount, calculateGrandTotal } from '../domain/promotion-amount.util';
import {
  throwCouponAlreadyApplied,
  throwCouponNotFound,
  throwExpiredPromotion,
  throwInactivePromotion,
  throwPromotionNotYetActive,
  throwPromotionRulesNotMet,
} from '../domain/promotion-domain.errors';
import { PromotionRepository } from '../repositories/promotion.repository';
import { PromotionConditionRepository } from '../repositories/promotion-condition.repository';
import { PromotionActionRepository } from '../repositories/promotion-action.repository';
import { PromotionApplicationRepository } from '../repositories/promotion-application.repository';
import {
  ApplyPromotionsResult,
  AppliedPromotionResult,
  PromotionOrderDraftContext,
} from '../types/promotion-order-draft.context';
import {
  CustomerSegmentationService,
  ExternalPromoProviderService,
  LoyaltyPointsService,
} from '../integrations';

@Injectable()
export class PromotionsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly promotionRepository: PromotionRepository,
    private readonly conditionRepository: PromotionConditionRepository,
    private readonly actionRepository: PromotionActionRepository,
    private readonly applicationRepository: PromotionApplicationRepository,
    private readonly customerSegmentationService: CustomerSegmentationService,
    private readonly loyaltyPointsService: LoyaltyPointsService,
    private readonly externalPromoProviderService: ExternalPromoProviderService,
  ) {}

  async applyPromotions(context: PromotionOrderDraftContext): Promise<ApplyPromotionsResult> {
    if (context.action === 'void') {
      return this.emptyResult(context);
    }

    const candidates = await this.resolveCandidates(context);
    const applied: AppliedPromotionResult[] = [];
    let discountTotal = 0;
    let bestNonStackable: AppliedPromotionResult | null = null;

    for (const promotion of candidates) {
      this.assertPromotionSchedulable(promotion);

      if (promotion.type === PromotionType.COUPON && context.orderId) {
        const already = await this.applicationRepository.hasCouponAppliedToOrder(
          context.tenantId,
          context.orderId,
          promotion.id,
        );
        if (already) {
          throwCouponAlreadyApplied(context.orderId, promotion.code ?? promotion.id);
        }
      }

      if (!this.matchesPromotionScope(promotion, context)) {
        continue;
      }

      if (!(await this.evaluateRules(promotion, context))) {
        if (promotion.type === PromotionType.COUPON) {
          throwPromotionRulesNotMet(promotion.id);
        }
        continue;
      }

      const stackable = this.isStackable(promotion);

      const discount = await this.applyActions(promotion, context);
      if (discount <= 0) {
        continue;
      }

      const result = {
        promotionId: promotion.id,
        code: promotion.code,
        discountAmount: formatAmount(discount),
      };

      if (stackable) {
        discountTotal += discount;
        applied.push(result);
      } else if (!bestNonStackable || discount > parseAmount(bestNonStackable.discountAmount)) {
        bestNonStackable = result;
      }
    }

    if (bestNonStackable) {
      discountTotal += parseAmount(bestNonStackable.discountAmount);
      applied.push(bestNonStackable);
    }

    const cappedDiscount = Math.min(discountTotal, parseAmount(context.subtotal));
    const grandTotal = calculateGrandTotal({
      subtotal: parseAmount(context.subtotal),
      discountTotal: cappedDiscount,
      taxTotal: parseAmount(context.taxTotal),
      serviceChargeTotal: parseAmount(context.serviceChargeTotal),
      deliveryFee: parseAmount(context.deliveryFee),
    });

    if (context.orderId) {
      await this.dataSource.transaction(async (manager) => {
        for (const item of applied) {
          await this.recordApplication(
            context.tenantId,
            item.promotionId,
            context.orderId ?? null,
            context.customerId ?? null,
            item.discountAmount,
            { couponCode: item.code ?? null, channel: context.channel ?? 'both' },
            manager,
          );

          const promo = await this.promotionRepository.findByIdForTenant(
            context.tenantId,
            item.promotionId,
            manager,
          );
          if (promo) {
            promo.usageCount += 1;
            await this.promotionRepository.save(promo, manager);
          }
        }
      });
    }

    if (context.orderId) {
      for (const item of applied) {
        this.loyaltyPointsService.accrueForApplication(
          context.tenantId,
          context.customerId ?? null,
          parseAmount(item.discountAmount),
        );
      }
    }

    return {
      discountTotal: formatAmount(cappedDiscount),
      promotionIds: applied.map((a) => a.promotionId),
      appliedPromotions: applied,
      grandTotal,
    };
  }

  async validateCoupon(
    code: string,
    context: PromotionOrderDraftContext,
  ): Promise<PromotionEntity> {
    const promotion = await this.promotionRepository.findByCodeForTenant(context.tenantId, code);
    if (!promotion || promotion.type !== PromotionType.COUPON) {
      throwCouponNotFound(code);
    }

    const full = await this.promotionRepository.findByIdWithRulesAndActions(
      context.tenantId,
      promotion.id,
    );
    if (!full) {
      throwCouponNotFound(code);
    }

    this.assertPromotionSchedulable(full);

    if (!(await this.evaluateRules(full, context))) {
      throwPromotionRulesNotMet(full.id);
    }

    return full;
  }

  async evaluateRules(
    promotion: PromotionEntity,
    context: PromotionOrderDraftContext,
  ): Promise<boolean> {
    const rules =
      promotion.conditions ??
      (await this.conditionRepository.findByPromotionId(promotion.id));

    if (rules.length === 0) {
      return true;
    }

    for (const rule of rules) {
      if (!this.evaluateRule(rule, context, promotion)) {
        return false;
      }
    }

    return true;
  }

  async applyActions(
    promotion: PromotionEntity,
    context: PromotionOrderDraftContext,
  ): Promise<number> {
    const actions =
      promotion.actions ?? (await this.actionRepository.findByPromotionId(promotion.id));

    if (actions.length === 0) {
      return this.applyPromotionType(promotion, context);
    }

    let total = 0;
    const subtotal = parseAmount(context.subtotal);

    for (const action of actions) {
      total += this.applyAction(action, context);
    }

    return Math.min(total, subtotal);
  }

  async recordApplication(
    tenantId: string,
    promotionId: string,
    orderId: string | null,
    customerId: string | null,
    discountAmount: string,
    metadata: Record<string, unknown> = {},
    manager?: EntityManager,
  ): Promise<string> {
    const row = await this.applicationRepository.create(
      {
        tenantId,
        promotionId,
        orderId,
        customerId,
        discountAmount,
        metadata,
      },
      manager,
    );
    return row.id;
  }

  private async resolveCandidates(
    context: PromotionOrderDraftContext,
  ): Promise<PromotionEntity[]> {
    const automatic = await this.promotionRepository.findActiveAutomaticForTenant(
      context.tenantId,
    );

    const loadedAutomatic = await Promise.all(
      automatic.map((p) =>
        this.promotionRepository.findByIdWithRulesAndActions(context.tenantId, p.id),
      ),
    );

    const candidates = loadedAutomatic.filter((p): p is PromotionEntity => p !== null);

    if (context.couponCode) {
      const coupon = await this.promotionRepository.findByCodeForTenant(
        context.tenantId,
        context.couponCode,
      );
      if (coupon) {
        const full = await this.promotionRepository.findByIdWithRulesAndActions(
          context.tenantId,
          coupon.id,
        );
        if (full) {
          candidates.push(full);
        }
      }
    }

    return candidates;
  }

  private matchesPromotionScope(
    promotion: PromotionEntity,
    context: PromotionOrderDraftContext,
  ): boolean {
    const autoApply = promotion.autoApply ?? promotion.type === PromotionType.AUTOMATIC;
    if (!autoApply && promotion.code !== context.couponCode) {
      return false;
    }
    if (promotion.channel !== 'both' && context.channel && promotion.channel !== context.channel) {
      return false;
    }
    if (promotion.applicableLocations?.length && context.locationId) {
      if (!promotion.applicableLocations.includes(context.locationId)) return false;
    }
    if (promotion.applicableItems?.length) {
      if (!context.lines.some((line) => promotion.applicableItems.includes(line.productId))) return false;
    }
    if (promotion.applicableCategories?.length) {
      if (!context.lines.some((line) => line.categoryId && promotion.applicableCategories.includes(line.categoryId))) return false;
    }
    if (promotion.minSpend && parseAmount(context.subtotal) < parseAmount(promotion.minSpend)) {
      return false;
    }
    if ((promotion.metadata as { firstOrderOnly?: boolean })?.firstOrderOnly && !context.isFirstOrder) {
      return false;
    }
    return true;
  }

  private assertPromotionSchedulable(promotion: PromotionEntity): void {
    const label = promotion.code ?? promotion.id;

    if (!promotion.isActive) {
      throwInactivePromotion(label);
    }

    const now = new Date();
    if (promotion.startDate && promotion.startDate > now) {
      throwPromotionNotYetActive(label);
    }
    if (promotion.endDate && promotion.endDate < now) {
      throwExpiredPromotion(label);
    }

    if (promotion.usageLimit !== null && promotion.usageCount >= promotion.usageLimit) {
      throwExpiredPromotion(label);
    }
  }

  private evaluateRule(
    rule: PromotionConditionEntity,
    context: PromotionOrderDraftContext,
    promotion: PromotionEntity,
  ): boolean {
    const config = rule.ruleConfig;

    switch (rule.ruleType) {
      case RuleType.MIN_ORDER_VALUE: {
        const min = parseAmount(String(config.minAmount ?? config.min ?? 0));
        return parseAmount(context.subtotal) >= min;
      }

      case RuleType.PRODUCT_IN_CART: {
        const productId = String(config.productId ?? '');
        return context.lines.some((line) => line.productId === productId);
      }

      case RuleType.CATEGORY_IN_CART: {
        const categoryId = String(config.categoryId ?? '');
        return context.lines.some((line) => line.categoryId === categoryId);
      }

      case RuleType.CUSTOMER_SEGMENT: {
        const segmentId = String(config.segmentId ?? 'default');
        return this.customerSegmentationService.matchesContext(context, segmentId);
      }

      case RuleType.TIME_WINDOW: {
        const start = config.startTime ? String(config.startTime) : null;
        const end = config.endTime ? String(config.endTime) : null;
        if (!start || !end) {
          return true;
        }
        const now = new Date();
        const minutes = now.getHours() * 60 + now.getMinutes();
        const startMin = this.parseTimeToMinutes(start);
        const endMin = this.parseTimeToMinutes(end);
        if (startMin === null || endMin === null) {
          return true;
        }
        if (startMin <= endMin) {
          return minutes >= startMin && minutes <= endMin;
        }
        return minutes >= startMin || minutes <= endMin;
      }

      case RuleType.LOCATION: {
        const locationIds = this.asStringArray(config.locationIds ?? config.locationId);
        return !locationIds.length || (context.locationId ? locationIds.includes(context.locationId) : false);
      }

      case RuleType.CHANNEL: {
        const channel = String(config.channel ?? 'both');
        return channel === 'both' || channel === context.channel;
      }

      case RuleType.FIRST_ORDER:
        return context.isFirstOrder === true;

      default:
        return true;
    }
  }

  private applyAction(action: PromotionActionEntity, context: PromotionOrderDraftContext): number {
    const config = action.actionConfig;
    const subtotal = parseAmount(context.subtotal);

    switch (action.actionType) {
      case ActionType.PERCENTAGE_DISCOUNT: {
        const pct = parseAmount(String(config.percentage ?? config.percent ?? 0));
        return (subtotal * pct) / 100;
      }
      case ActionType.FIXED_DISCOUNT: {
        return parseAmount(String(config.amount ?? 0));
      }
      case ActionType.FREE_ITEM: {
        return parseAmount(String(config.discountAmount ?? config.amount ?? 0));
      }
      case ActionType.FREE_DELIVERY: {
        return parseAmount(context.deliveryFee);
      }
      case ActionType.BUY_X_GET_Y: {
        const buyQuantity = Number(config.buyQuantity ?? 0);
        const getQuantity = Number(config.getQuantity ?? 0);
        if (!buyQuantity || !getQuantity) return 0;
        return this.calculateBxgyDiscount(context, buyQuantity, getQuantity);
      }
      default:
        return 0;
    }
  }

  private applyPromotionType(
    promotion: PromotionEntity,
    context: PromotionOrderDraftContext,
  ): number {
    const subtotal = parseAmount(context.subtotal);
    const value = parseAmount(promotion.value);
    switch (promotion.type) {
      case PromotionType.PERCENTAGE:
      case PromotionType.CATEGORY:
      case PromotionType.TIME_BASED:
        return (this.scopedSubtotal(promotion, context) * value) / 100;
      case PromotionType.BXGY:
        return this.calculateBxgyDiscount(
          context,
          promotion.buyQuantity ?? 0,
          promotion.getQuantity ?? 0,
          promotion,
        );
      case PromotionType.FIXED:
      case PromotionType.THRESHOLD:
      case PromotionType.COUPON:
      case PromotionType.AUTOMATIC:
      default:
        return Math.min(value, subtotal);
    }
  }

  private scopedSubtotal(promotion: PromotionEntity, context: PromotionOrderDraftContext): number {
    const scoped = context.lines.filter((line) => {
      const itemMatch = !promotion.applicableItems?.length || promotion.applicableItems.includes(line.productId);
      const categoryMatch =
        !promotion.applicableCategories?.length ||
        (line.categoryId ? promotion.applicableCategories.includes(line.categoryId) : false);
      return itemMatch && categoryMatch;
    });
    const lines = scoped.length ? scoped : context.lines;
    return lines.reduce((sum, line) => sum + parseAmount(line.lineSubtotal), 0);
  }

  private calculateBxgyDiscount(
    context: PromotionOrderDraftContext,
    buyQuantity: number,
    getQuantity: number,
    promotion?: PromotionEntity,
  ): number {
    const eligible = context.lines.filter((line) => {
      if (promotion?.applicableItems?.length && !promotion.applicableItems.includes(line.productId)) return false;
      if (
        promotion?.applicableCategories?.length &&
        (!line.categoryId || !promotion.applicableCategories.includes(line.categoryId))
      ) {
        return false;
      }
      return true;
    });
    return eligible.reduce((sum, line) => {
      const groupSize = buyQuantity + getQuantity;
      const freeUnits = groupSize > 0 ? Math.floor(line.quantity / groupSize) * getQuantity : 0;
      const unitPrice = line.quantity > 0 ? parseAmount(line.lineSubtotal) / line.quantity : 0;
      return sum + freeUnits * unitPrice;
    }, 0);
  }

  private isStackable(promotion: PromotionEntity): boolean {
    const metaRules = promotion.rules ?? [];
    if (metaRules.length === 0) {
      return Boolean((promotion.metadata as { stackable?: boolean })?.stackable);
    }
    return metaRules.some((rule) => rule.isStackable);
  }

  private parseTimeToMinutes(value: string): number | null {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  }

  private asStringArray(value: unknown): string[] {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (!value) return [];
    return [String(value)];
  }

  private emptyResult(context: PromotionOrderDraftContext): ApplyPromotionsResult {
    return {
      discountTotal: '0.00',
      promotionIds: [],
      appliedPromotions: [],
      grandTotal: calculateGrandTotal({
        subtotal: parseAmount(context.subtotal),
        discountTotal: 0,
        taxTotal: parseAmount(context.taxTotal),
        serviceChargeTotal: parseAmount(context.serviceChargeTotal),
        deliveryFee: parseAmount(context.deliveryFee),
      }),
    };
  }
}
