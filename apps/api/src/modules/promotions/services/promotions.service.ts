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
  throwIncompatiblePromotionStacking,
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
    let hasNonStackable = false;

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

      if (!(await this.evaluateRules(promotion, context))) {
        if (promotion.type === PromotionType.COUPON) {
          throwPromotionRulesNotMet(promotion.id);
        }
        continue;
      }

      const stackable = this.isStackable(promotion);
      if (!stackable && hasNonStackable) {
        throwIncompatiblePromotionStacking();
      }
      if (!stackable && applied.length > 0) {
        throwIncompatiblePromotionStacking();
      }

      const discount = await this.applyActions(promotion, context);
      if (discount <= 0) {
        continue;
      }

      if (!stackable) {
        hasNonStackable = true;
      }

      discountTotal += discount;
      applied.push({
        promotionId: promotion.id,
        code: promotion.code,
        discountAmount: formatAmount(discount),
      });
    }

    const cappedDiscount = Math.min(discountTotal, parseAmount(context.subtotal));
    const grandTotal = calculateGrandTotal({
      subtotal: parseAmount(context.subtotal),
      discountTotal: cappedDiscount,
      taxTotal: parseAmount(context.taxTotal),
      serviceChargeTotal: parseAmount(context.serviceChargeTotal),
      deliveryFee: parseAmount(context.deliveryFee),
    });

    await this.dataSource.transaction(async (manager) => {
      for (const item of applied) {
        await this.recordApplication(
          context.tenantId,
          item.promotionId,
          context.orderId ?? null,
          context.customerId ?? null,
          item.discountAmount,
          { couponCode: item.code ?? null },
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

    for (const item of applied) {
      this.loyaltyPointsService.accrueForApplication(
        context.tenantId,
        context.customerId ?? null,
        parseAmount(item.discountAmount),
      );
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
      const legacy = parseAmount(promotion.value);
      return legacy > 0 ? legacy : 0;
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
      default:
        return 0;
    }
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
