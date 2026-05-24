import { Injectable } from '@nestjs/common';
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

const DEFAULT_CURRENCY = 'USD';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly basketService: BasketService,
    private readonly menuRepository: MenuQueryRepository,
    private readonly promotionsService: PromotionsService,
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

    const baseTotals = calculateOnlineTotals({ lines, orderType });
    const promotionContext = this.buildPromotionContext(
      tenant.tenantId,
      basket.couponCode,
      baseTotals,
      lines,
    );

    if (basket.couponCode) {
      await this.promotionsService.validateCoupon(basket.couponCode, promotionContext);
    }

    const promotionResult = await this.promotionsService.applyPromotions(promotionContext);
    const totals = calculateOnlineTotals({
      lines,
      orderType,
      discountTotal: promotionResult.discountTotal,
    });

    const paymentContext: PaymentOrderContext = {
      tenantId: tenant.tenantId,
      orderId: '',
      amount: totals.grandTotal,
      currency: dto.currency ?? DEFAULT_CURRENCY,
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
      });
    }

    return priced;
  }

  private buildPromotionContext(
    tenantId: string,
    couponCode: string | undefined,
    totals: ReturnType<typeof calculateOnlineTotals>,
    lines: OnlineLinePricing[],
  ): PromotionOrderDraftContext {
    return {
      tenantId,
      couponCode: couponCode ?? null,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      deliveryFee: totals.deliveryFee,
      serviceChargeTotal: totals.serviceChargeTotal,
      lines: lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        lineSubtotal: line.lineSubtotal,
        categoryId: line.categoryId,
      })),
    };
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
}
