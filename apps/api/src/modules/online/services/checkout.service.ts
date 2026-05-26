import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { ProductStatus } from '../../catalog/enums/product-status.enum';
import { OrderType } from '../../orders/enums/order-type.enum';
import { PromotionsService } from '../../promotions/services/promotions.service';
import { PromotionOrderDraftContext } from '../../promotions/types/promotion-order-draft.context';
import { PaymentOrderContext } from '../../payments/types/payment-order.context';
import {
  throwOnlineDeliveryAddressRequired,
  throwOnlineInsufficientStock,
  throwOnlineProductInactive,
  throwOnlineProductOutOfStock,
} from '../domain/online-domain.errors';
import {
  calculateOnlineTotals,
  isOnlineChannelVisible,
  OnlineLinePricing,
} from '../domain/online-pricing.util';
import { MenuQueryRepository } from '../repositories/menu-query.repository';
import { BasketService } from './basket.service';
import { OnlineCheckoutDto } from '../dto/online-checkout.dto';
import { OnlineCheckoutResult } from '../types';
import { OnlineOrderType } from '../enums/online-order-type.enum';
import { parseMoney, formatMoney, sumMoney } from '../../orders/domain/order-totals.util';
import { TaxCalculationService } from '../../tax';
import { TenantSettingsEntity } from '../../onboarding/entities/tenant-settings.entity';

const DEFAULT_CURRENCY = 'EUR';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly basketService: BasketService,
    private readonly menuRepository: MenuQueryRepository,
    private readonly promotionsService: PromotionsService,
    private readonly taxCalculation: TaxCalculationService,
    @InjectRepository(TenantSettingsEntity)
    private readonly tenantSettingsRepository: Repository<TenantSettingsEntity>,
  ) {}

  async checkout(tenant: TenantContext, dto: OnlineCheckoutDto): Promise<OnlineCheckoutResult> {
    const basket = this.basketService.getBasket(tenant.tenantId, dto.sessionId);
    this.basketService.assertBasketHasItems(basket);

    if (dto.couponCode) {
      this.basketService.setCouponCode(dto.sessionId, dto.couponCode);
    }

    const lines = await this.validateAndPriceLines(tenant.tenantId, basket.locationId, basket.items);
    const orderType = this.resolveOrderType(dto.orderType);

    if (orderType === OrderType.DELIVERY) {
      this.assertDeliveryDetails(dto.delivery);
    }
    const deliveryFee = await this.resolveDeliveryFee(tenant.tenantId, orderType, lines);

    const baseTax = await this.calculateTax(tenant, basket.locationId, lines, '0.00', orderType, deliveryFee);
    const baseTotals = calculateOnlineTotals({
      lines,
      orderType,
      deliveryFee,
      taxTotal: baseTax.taxTotal,
      chargeableTaxTotal: baseTax.chargeableTaxTotal,
    });
    const promotionContext = this.buildPromotionContext(
      tenant.tenantId,
      basket.couponCode,
      baseTotals,
      lines,
      basket.locationId,
      dto.customerId,
      orderType,
    );

    if (basket.couponCode) {
      await this.promotionsService.validateCoupon(basket.couponCode, promotionContext);
    }

    const promotionResult = await this.promotionsService.applyPromotions(promotionContext);
    const tax = await this.calculateTax(
      tenant,
      basket.locationId,
      lines,
      promotionResult.discountTotal,
      orderType,
      deliveryFee,
    );
    const totals = {
      ...calculateOnlineTotals({
        lines,
        orderType,
        deliveryFee,
        discountTotal: promotionResult.discountTotal,
        taxTotal: tax.taxTotal,
        chargeableTaxTotal: tax.chargeableTaxTotal,
      }),
      taxLines: tax.lines,
    };

    const paymentContext: PaymentOrderContext = {
      tenantId: tenant.tenantId,
      orderId: '',
      amount: totals.grandTotal,
      currency: this.resolveCurrency(tenant, dto.currency),
      method: dto.paymentMethod ?? 'card',
      customerId: dto.customerId ?? null,
      reason: 'online_checkout',
    };

    const snapshot = {
      orderType: dto.orderType,
      customer: dto.customer,
      delivery: dto.delivery,
      totals,
      appliedPromotions: promotionResult.appliedPromotions,
      paymentContext,
    };

    this.basketService.setCheckout(basket, snapshot);

    return {
      sessionId: basket.sessionId,
      orderType: dto.orderType,
      customer: dto.customer,
      delivery: dto.delivery,
      totals,
      appliedPromotions: promotionResult.appliedPromotions,
      paymentContext,
    };
  }

  private async validateAndPriceLines(
    tenantId: string,
    locationId: string,
    items: Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      modifierOptionIds?: string[];
    }>,
  ): Promise<OnlineLinePricing[]> {
    const priced: OnlineLinePricing[] = [];

    for (const item of items) {
      const product = await this.menuRepository.findProductByIdForTenant(tenantId, item.productId);
      if (!product || product.status !== ProductStatus.ACTIVE || !isOnlineChannelVisible(product.channelVisibility)) {
        throwOnlineProductInactive(item.productId);
      }

      const available = await this.menuRepository.getAvailableQuantity(
        tenantId,
        locationId,
        item.productId,
      );
      if (available !== null) {
        if (available <= 0) {
          throwOnlineProductOutOfStock(item.productId);
        }
        if (item.quantity > available) {
          throwOnlineInsufficientStock(item.productId, item.quantity, available);
        }
      }

      let unitPrice = product.price;
      if (item.variantId) {
        const variant = await this.menuRepository.findVariantById(item.variantId);
        if (variant && variant.productId === item.productId) {
          unitPrice = formatMoney(parseMoney(product.price) + parseMoney(variant.priceDelta));
        }
      }

      const modifierOptions = await this.menuRepository.findModifierOptionsByIds(
        item.modifierOptionIds ?? [],
      );
      const modifierTotal = formatMoney(sumMoney(modifierOptions.map((option) => option.priceDelta)));
      const unitWithModifiers = formatMoney(parseMoney(unitPrice) + parseMoney(modifierTotal));
      const lineSubtotal = formatMoney(parseMoney(unitWithModifiers) * item.quantity);

      priced.push({
        productId: item.productId,
        variantId: item.variantId ?? null,
        quantity: item.quantity,
        unitPrice,
        modifierTotal,
        lineSubtotal,
        categoryId: product.categoryId,
        taxCategoryId: product.taxCategoryId,
        stockLevel: available,
      });
    }

    return priced;
  }

  private buildPromotionContext(
    tenantId: string,
    couponCode: string | undefined,
    totals: ReturnType<typeof calculateOnlineTotals>,
    lines: OnlineLinePricing[],
    locationId: string,
    customerId: string | undefined,
    orderType: OrderType,
  ): PromotionOrderDraftContext {
    return {
      tenantId,
      couponCode: couponCode ?? null,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      deliveryFee: totals.deliveryFee,
      serviceChargeTotal: totals.serviceChargeTotal,
      locationId,
      customerId: customerId ?? null,
      channel: 'online',
      orderType,
      lines: lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        lineSubtotal: line.lineSubtotal,
        categoryId: line.categoryId,
        stockLevel: line.stockLevel ?? null,
      })),
    };
  }

  private calculateTax(
    tenant: TenantContext,
    locationId: string,
    lines: OnlineLinePricing[],
    discountTotal: string,
    orderType: OrderType,
    deliveryFee: string,
  ) {
    return this.taxCalculation.calculateOrderTax({
      tenant,
      locationId,
      lines: lines.map((line) => ({
        productId: line.productId,
        categoryId: line.categoryId,
        taxCategoryId: line.taxCategoryId ?? null,
        variantId: line.variantId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        modifierTotal: line.modifierTotal,
        unitPriceWithModifiers: formatMoney(parseMoney(line.unitPrice) + parseMoney(line.modifierTotal)),
        lineSubtotal: line.lineSubtotal,
        lineTax: '0.00',
        lineDiscount: '0.00',
        notes: null,
        modifiers: [],
      })),
      discountTotal,
      deliveryFee: orderType === OrderType.DELIVERY ? deliveryFee : '0.00',
      serviceChargeTotal: '0.00',
    });
  }

  private async resolveDeliveryFee(
    tenantId: string,
    orderType: OrderType,
    lines: OnlineLinePricing[],
  ): Promise<string> {
    if (orderType !== OrderType.DELIVERY) return '0.00';
    const settings = await this.tenantSettingsRepository.findOne({ where: { tenantId } });
    const subtotal = sumMoney(lines.map((line) => line.lineSubtotal));
    if (settings && !settings.deliveryEnabled) throw new BadRequestException('Delivery is disabled for this tenant');
    const minimum = parseMoney(settings?.minimumOrderAmount ?? '0.00');
    if (subtotal < minimum) throw new BadRequestException(`Delivery requires a minimum order of ${settings?.minimumOrderAmount}`);
    const freeThreshold = settings?.freeDeliveryThreshold ? parseMoney(settings.freeDeliveryThreshold) : null;
    if (freeThreshold !== null && subtotal >= freeThreshold) return formatMoney(0);
    return formatMoney(parseMoney(settings?.deliveryFee ?? '3.99'));
  }

  private resolveOrderType(orderType: OnlineOrderType): OrderType {
    if (orderType === OnlineOrderType.DELIVERY) {
      return OrderType.DELIVERY;
    }
    if (orderType === OnlineOrderType.PICKUP) {
      return OrderType.PICKUP;
    }
    return OrderType.ONLINE;
  }

  private assertDeliveryDetails(
    delivery?: OnlineCheckoutDto['delivery'],
  ): asserts delivery is NonNullable<OnlineCheckoutDto['delivery']> {
    if (!delivery?.addressLine1?.trim() || !delivery.city?.trim()) {
      throwOnlineDeliveryAddressRequired();
    }
  }

  private resolveCurrency(tenant: TenantContext, currency?: string): string {
    return (currency ?? tenant.settings?.currency ?? DEFAULT_CURRENCY).trim().toUpperCase();
  }
}
