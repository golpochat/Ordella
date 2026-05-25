import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { CalculatedLineItem } from '../../orders/types/draft-order.types';
import { formatMoney, parseMoney } from '../../orders/domain/order-totals.util';
import { OrderItemEntity } from '../../orders/entities/order-item.entity';
import { OrderTaxLineEntity, TaxCategoryEntity, TaxRuleEntity } from '../entities';
import { DEFAULT_ORDER_TAX_RATE } from '../../orders/constants/order-tax.constants';

export type TaxBreakdownLine = {
  orderItemId?: string | null;
  productId?: string;
  taxRuleId: string | null;
  taxCategoryId: string | null;
  taxName: string;
  taxType: string;
  priceMode: 'inclusive' | 'exclusive';
  taxRate: string;
  taxableAmount: string;
  taxAmount: string;
  jurisdiction: string;
};

export type TaxCalculationResult = {
  taxTotal: string;
  chargeableTaxTotal: string;
  lines: TaxBreakdownLine[];
};

@Injectable()
export class TaxCalculationService {
  constructor(
    @InjectRepository(TaxRuleEntity)
    private readonly taxRules: Repository<TaxRuleEntity>,
    @InjectRepository(TaxCategoryEntity)
    private readonly taxCategories: Repository<TaxCategoryEntity>,
    @InjectRepository(OrderTaxLineEntity)
    private readonly orderTaxLines: Repository<OrderTaxLineEntity>,
  ) {}

  async calculateOrderTax(input: {
    tenant: TenantContext;
    locationId: string;
    lines: CalculatedLineItem[];
    items?: OrderItemEntity[];
    discountTotal: string;
    deliveryFee: string;
    serviceChargeTotal: string;
  }): Promise<TaxCalculationResult> {
    const rules = await this.loadRules(input.tenant.tenantId, input.locationId);
    const categories = await this.taxCategories.find({ where: { tenantId: input.tenant.tenantId } });
    const itemByProduct = new Map((input.items ?? []).map((item) => [item.productId, item]));
    const subtotal = input.lines.reduce((sum, line) => sum + parseMoney(line.lineSubtotal), 0);
    const discount = parseMoney(input.discountTotal);
    const breakdown: TaxBreakdownLine[] = [];

    for (const line of input.lines) {
      const lineSubtotal = parseMoney(line.lineSubtotal);
      const discountShare = subtotal > 0 ? discount * (lineSubtotal / subtotal) : 0;
      const baseAmount = Math.max(0, lineSubtotal - discountShare);
      const category = line.taxCategoryId
        ? categories.find((candidate) => candidate.id === line.taxCategoryId)
        : null;
      const rule = this.resolveRule(rules, 'items', category?.defaultTaxRuleId ?? null) ??
        this.resolveRule(rules, 'categories', category?.defaultTaxRuleId ?? null);
      if (!rule) continue;
      const tax = this.calculateRuleTax(baseAmount, rule);
      const item = itemByProduct.get(line.productId);
      breakdown.push({
        orderItemId: item?.id ?? null,
        productId: line.productId,
        taxRuleId: rule.id,
        taxCategoryId: category?.id ?? null,
        taxName: rule.taxName,
        taxType: rule.taxType,
        priceMode: rule.priceMode,
        taxRate: rule.taxRate,
        taxableAmount: formatMoney(tax.taxableAmount),
        taxAmount: formatMoney(tax.taxAmount),
        jurisdiction: this.jurisdiction(rule),
      });
    }

    for (const fee of [
      { amount: parseMoney(input.deliveryFee), appliesTo: 'delivery' as const },
      { amount: parseMoney(input.serviceChargeTotal), appliesTo: 'service_fee' as const },
    ]) {
      const rule = this.resolveRule(rules, fee.appliesTo, null);
      if (!rule || fee.amount <= 0) continue;
      const tax = this.calculateRuleTax(fee.amount, rule);
      breakdown.push({
        orderItemId: null,
        taxRuleId: rule.id,
        taxCategoryId: null,
        taxName: rule.taxName,
        taxType: rule.taxType,
        priceMode: rule.priceMode,
        taxRate: rule.taxRate,
        taxableAmount: formatMoney(tax.taxableAmount),
        taxAmount: formatMoney(tax.taxAmount),
        jurisdiction: this.jurisdiction(rule),
      });
    }

    return {
      taxTotal: formatMoney(breakdown.reduce((sum, line) => sum + parseMoney(line.taxAmount), 0)),
      chargeableTaxTotal: formatMoney(
        breakdown.reduce(
          (sum, line) => sum + (line.priceMode === 'exclusive' ? parseMoney(line.taxAmount) : 0),
          0,
        ),
      ),
      lines: breakdown,
    };
  }

  async replaceOrderTaxLines(
    tenantId: string,
    locationId: string,
    orderId: string,
    lines: TaxBreakdownLine[],
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager?.getRepository(OrderTaxLineEntity) ?? this.orderTaxLines;
    await repo.delete({ tenantId, orderId });
    if (!lines.length) return;
    await repo.save(lines.map((line) => repo.create({
      tenantId,
      locationId,
      orderId,
      orderItemId: line.orderItemId ?? null,
      taxRuleId: line.taxRuleId,
      taxCategoryId: line.taxCategoryId,
      taxName: line.taxName,
      taxType: line.taxType as OrderTaxLineEntity['taxType'],
      priceMode: line.priceMode,
      taxRate: line.taxRate,
      taxableAmount: line.taxableAmount,
      taxAmount: line.taxAmount,
      jurisdiction: line.jurisdiction,
      metadata: { productId: line.productId ?? null },
    })));
  }

  listOrderTaxLines(tenantId: string, orderId: string) {
    return this.orderTaxLines.find({ where: { tenantId, orderId }, order: { createdAt: 'ASC' } });
  }

  private async loadRules(tenantId: string, locationId: string): Promise<TaxRuleEntity[]> {
    const all = await this.taxRules.find({ where: [{ tenantId, locationId }, { tenantId, locationId: IsNull() }] });
    if (!all.length) {
      return [
        Object.assign(new TaxRuleEntity(), {
          id: null,
          tenantId,
          locationId: null,
          country: 'XX',
          region: null,
          taxName: 'Standard tax',
          taxRate: (DEFAULT_ORDER_TAX_RATE * 100).toFixed(4),
          taxType: 'sales_tax',
          appliesTo: ['items'],
          priceMode: 'exclusive',
          isDefault: true,
          roundingMode: 'half_up',
          decimalPlaces: 2,
        }),
      ];
    }
    return all.sort((a, b) => Number(Boolean(b.locationId)) - Number(Boolean(a.locationId)) || Number(b.isDefault) - Number(a.isDefault));
  }

  private resolveRule(
    rules: TaxRuleEntity[],
    appliesTo: TaxRuleEntity['appliesTo'][number],
    preferredRuleId: string | null,
  ): TaxRuleEntity | null {
    const scoped = rules.filter((rule) => rule.appliesTo.includes(appliesTo));
    return scoped.find((rule) => rule.id === preferredRuleId) ?? scoped.find((rule) => rule.isDefault) ?? scoped[0] ?? null;
  }

  private calculateRuleTax(amount: number, rule: TaxRuleEntity): { taxableAmount: number; taxAmount: number } {
    const rate = parseMoney(rule.taxRate) / 100;
    const taxableAmount = rule.priceMode === 'inclusive' ? amount / (1 + rate) : amount;
    const rawTax = rule.priceMode === 'inclusive' ? amount - taxableAmount : taxableAmount * rate;
    return { taxableAmount, taxAmount: this.round(rawTax, rule) };
  }

  private round(amount: number, rule: TaxRuleEntity): number {
    const factor = 10 ** (rule.decimalPlaces ?? 2);
    if (rule.roundingMode === 'down') return Math.floor(amount * factor) / factor;
    if (rule.roundingMode === 'up') return Math.ceil(amount * factor) / factor;
    return Math.round(amount * factor) / factor;
  }

  private jurisdiction(rule: TaxRuleEntity): string {
    return [rule.country, rule.region].filter(Boolean).join('-');
  }
}
