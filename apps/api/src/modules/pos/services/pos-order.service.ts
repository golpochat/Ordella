import { Injectable } from '@nestjs/common';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { CreateOrderDto } from '../../orders/dto';
import { OrderResponseDto } from '../../orders/dto';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { OrderType } from '../../orders/enums/order-type.enum';
import { OrdersService } from '../../orders/services/orders.service';
import { PaymentsService } from '../../payments/services/payments.service';
import { PaymentOrderContext } from '../../payments/types/payment-order.context';
import { CartService } from './cart.service';
import { PosCheckoutDto } from '../dto/pos-checkout.dto';
import { PosPaymentDto } from '../dto/pos-payment.dto';
import {
  PosCheckoutResponseDto,
  PosPaymentResponseDto,
  PosReceiptResponseDto,
} from '../dto';
import { PosPaymentMethod } from '../enums/pos-payment-method.enum';
import { PosCompleteSaleDto } from '../dto/pos-complete-sale.dto';
import { LoyaltyService } from '../../loyalty/services';
import {
  throwPosCartAlreadyCheckedOut,
  throwPosContextMismatch,
  throwPosOrderNotFound,
  throwPosPaymentFailed,
} from '../domain/pos-domain.errors';
import { PosFulfillmentService } from './pos-fulfillment.service';
const DEFAULT_CURRENCY = 'EUR';

@Injectable()
export class PosOrderService {
  private readonly receiptContext = new Map<
    string,
    { terminalId: string; cashierId: string; shiftId: string; paidAt: string | null }
  >();

  constructor(
    private readonly cartService: CartService,
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
    private readonly fulfillmentService: PosFulfillmentService,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  async checkout(
    tenant: TenantContext,
    dto: PosCheckoutDto,
    user?: AuthenticatedUser,
  ): Promise<PosCheckoutResponseDto> {
    const cart = this.cartService.getCart(tenant.tenantId, dto.cartId);
    this.assertPosContextMatchesCart(cart, dto);
    if (cart.orderId) {
      throwPosCartAlreadyCheckedOut(cart.id);
    }
    this.cartService.assertCartHasItems(cart);

    const createDto: CreateOrderDto = {
      locationId: cart.locationId,
      orderType: dto.orderType ?? OrderType.POS,
      customerId: dto.customerId,
      loyaltyRedeemPoints: dto.loyaltyRedeemPoints,
      giftCardCode: dto.giftCardCode,
      giftCardAmount: dto.giftCardAmount,
      storeCreditAmount: dto.storeCreditAmount,
      couponCode: dto.couponCode,
      discountPercent: dto.discountPercent,
      discountFixed: dto.discountFixed,
      items: cart.items.map((line) => ({
        productId: line.productId,
        variantId: line.variantId,
        bundleId: line.bundleId,
        quantity: line.quantity,
        modifierOptionIds: line.modifierOptionIds,
        notes: line.notes,
      })),
    };

    const order = await this.ordersService.create(tenant, createDto, user);

    this.cartService.linkOrder(tenant.tenantId, cart.id, order.id);
    this.receiptContext.set(order.id, {
      terminalId: dto.terminalId,
      cashierId: dto.cashierId,
      shiftId: dto.shiftId,
      paidAt: null,
    });

    return {
      cartId: cart.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      subtotal: order.subtotal,
      discountTotal: order.discountTotal,
      tax: order.tax,
      taxLines: order.taxLines?.map((line) => ({
        taxName: line.taxName,
        taxType: line.taxType,
        priceMode: line.priceMode,
        taxRate: line.taxRate,
        taxableAmount: line.taxableAmount,
        taxAmount: line.taxAmount,
        jurisdiction: line.jurisdiction,
      })) ?? [],
      total: order.total,
      appliedPromotions: order.appliedPromotions,
    };
  }

  async completeSale(
    tenant: TenantContext,
    dto: PosCompleteSaleDto,
    user?: AuthenticatedUser,
  ): Promise<PosPaymentResponseDto & {
    orderNumber: string | null;
    subtotal: string;
    discountTotal: string;
    tax: string;
    taxLines: PosCheckoutResponseDto['taxLines'];
    total: string;
  }> {
    const customer =
      dto.customer?.customerId
        ? null
        : await this.loyaltyService.findOrCreateCustomer(tenant.tenantId, dto.customer ?? {});
    const customerId = dto.customer?.customerId ?? customer?.id;
    const checkout = await this.checkout(
      tenant,
      {
        cartId: dto.cartId,
        terminalId: dto.terminalId,
        cashierId: dto.cashierId,
        shiftId: dto.shiftId,
        customerId,
        loyaltyRedeemPoints: dto.loyaltyRedeemPoints,
        giftCardCode: dto.giftCardCode,
        giftCardAmount: dto.giftCardAmount,
        storeCreditAmount: dto.storeCreditAmount,
        couponCode: dto.couponCode,
        discountPercent: dto.discountPercent,
        discountFixed: dto.discountFixed,
        orderType: dto.orderType,
        orderNotes: dto.orderNotes,
      },
      user,
    );

    const payment = await this.pay(
      tenant,
      {
        orderId: checkout.orderId,
        terminalId: dto.terminalId,
        cashierId: dto.cashierId,
        shiftId: dto.shiftId,
        method: dto.paymentMethod,
      },
      user,
    );

    return {
      ...payment,
      orderNumber: checkout.orderNumber,
      subtotal: checkout.subtotal,
      discountTotal: checkout.discountTotal,
      tax: checkout.tax,
      taxLines: checkout.taxLines,
      total: checkout.total,
    };
  }

  async pay(
    tenant: TenantContext,
    dto: PosPaymentDto,
    user?: AuthenticatedUser,
  ): Promise<PosPaymentResponseDto> {
    const order = await this.ordersService.findOne(tenant, dto.orderId);
    const ctx = this.receiptContext.get(order.id);
    if (!ctx) {
      throwPosOrderNotFound(order.id);
    }
    if (
      ctx.terminalId !== dto.terminalId ||
      ctx.cashierId !== dto.cashierId ||
      ctx.shiftId !== dto.shiftId
    ) {
      throwPosOrderNotFound(order.id);
    }

    const paymentContext: PaymentOrderContext = {
      tenantId: tenant.tenantId,
      orderId: order.id,
      amount: order.total,
      currency: dto.currency ?? tenant.settings?.currency ?? DEFAULT_CURRENCY,
      method: dto.method,
      customerId: order.customerId,
      reason: 'pos_sale',
      stripePaymentIntentId: dto.stripePaymentIntentId ?? null,
    };

    const paymentResult = await this.paymentsService.authorizeOrCapture(paymentContext);
    if (paymentResult.status !== 'captured') {
      throwPosPaymentFailed(paymentResult.failureReason);
    }

    const updated = await this.ordersService.update(
      tenant,
      order.id,
      { status: OrderStatus.ACCEPTED },
      user,
    );

    ctx.paidAt = new Date().toISOString();

    const linkedCart = this.cartService.findByOrderId(tenant.tenantId, order.id);
    if (linkedCart) {
      this.cartService.deleteCart(tenant.tenantId, linkedCart.id);
    }

    await this.fulfillmentService.routeOrderToFulfillment(tenant.tenantId, order.id);

    return {
      orderId: updated.id,
      paymentId: paymentResult.paymentId,
      status: paymentResult.status,
      paymentStatus: updated.paymentStatus,
      orderStatus: updated.status,
    };
  }

  async getReceipt(tenant: TenantContext, orderId: string): Promise<PosReceiptResponseDto> {
    const order = await this.ordersService.findOne(tenant, orderId);
    const ctx = this.receiptContext.get(order.id);
    if (!ctx) {
      throwPosOrderNotFound(orderId);
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      terminalId: ctx.terminalId,
      cashierId: ctx.cashierId,
      shiftId: ctx.shiftId,
      locationId: order.locationId,
      orderType: order.orderType,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      discountTotal: order.discountTotal,
      tax: order.tax,
      taxLines: order.taxLines?.map((line) => ({
        taxName: line.taxName,
        taxType: line.taxType,
        priceMode: line.priceMode,
        taxRate: line.taxRate,
        taxableAmount: line.taxableAmount,
        taxAmount: line.taxAmount,
        jurisdiction: line.jurisdiction,
      })) ?? [],
      total: order.total,
      appliedPromotions: order.appliedPromotions,
      items: (order.items ?? []).map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes,
      })),
      paidAt: ctx.paidAt,
      createdAt: order.createdAt.toISOString(),
    };
  }

  private assertPosContextMatchesCart(
    cart: { terminalId: string; cashierId: string; shiftId: string },
    dto: { terminalId: string; cashierId: string; shiftId: string },
  ): void {
    if (
      cart.terminalId !== dto.terminalId ||
      cart.cashierId !== dto.cashierId ||
      cart.shiftId !== dto.shiftId
    ) {
      throwPosContextMismatch();
    }
  }
}
