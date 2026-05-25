import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { TenantContext } from '../../../common/interfaces';
import { StripeClientService } from '../../billing/services/stripe-client.service';
import { ProductStatus } from '../../catalog/enums/product-status.enum';
import { CreateOrderDto } from '../../orders/dto';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { OrderType } from '../../orders/enums/order-type.enum';
import { OrderPaymentMethod } from '../../orders/enums/order-payment-method.enum';
import { OrdersService } from '../../orders/services/orders.service';
import { parseMoney, formatMoney } from '../../orders/domain/order-totals.util';
import { PaymentsService } from '../../payments/services/payments.service';
import { DeliveryService } from '../../deliveries/services/delivery.service';
import { KdsBroadcastService } from '../../kds/services/kds-broadcast.service';
import { KdsOrderQueryService } from '../../kds/services/kds-order-query.service';
import { LocationEntity } from '../../tenants/entities/location.entity';
import {
  calculateOnlineTotals,
  isOnlineChannelVisible,
} from '../domain/online-pricing.util';
import {
  throwOnlineDeliveryAddressRequired,
  throwOnlineInsufficientStock,
  throwOnlineProductInactive,
  throwOnlineProductOutOfStock,
  throwOnlinePaymentFailed,
} from '../domain/online-domain.errors';
import { MenuQueryRepository } from '../repositories/menu-query.repository';
import { OnlineOrderType } from '../enums/online-order-type.enum';
import { CreateCheckoutSessionDto } from '../dto/create-checkout-session.dto';
import { StripeCheckoutPendingStore } from './stripe-checkout-pending.store';
import { LoyaltyService } from '../../loyalty/services';
import { GiftCardsService } from '../../giftcards/services';

const DEFAULT_CURRENCY = 'EUR';
const TOTAL_TOLERANCE = 0.02;

@Injectable()
export class OnlineStripeCheckoutService {
  private readonly logger = new Logger(OnlineStripeCheckoutService.name);

  constructor(
    private readonly stripeClient: StripeClientService,
    private readonly pendingStore: StripeCheckoutPendingStore,
    private readonly menuRepository: MenuQueryRepository,
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
    private readonly deliveryService: DeliveryService,
    private readonly kdsOrderQuery: KdsOrderQueryService,
    private readonly kdsBroadcast: KdsBroadcastService,
    private readonly loyaltyService: LoyaltyService,
    private readonly giftCardsService: GiftCardsService,
    @InjectRepository(LocationEntity)
    private readonly locationRepository: Repository<LocationEntity>,
  ) {}

  getPublicConfig(): { publishableKey: string | null; stripeConfigured: boolean } {
    return {
      publishableKey: this.stripeClient.publishableKey(),
      stripeConfigured: this.stripeClient.isConfigured(),
    };
  }

  async createCheckoutSession(
    tenant: TenantContext,
    dto: CreateCheckoutSessionDto,
  ): Promise<{ sessionId: string; url: string }> {
    await this.assertLocationBelongsToTenant(tenant.tenantId, dto.locationId);

    const lines = await this.validateAndPriceLines(
      tenant.tenantId,
      dto.locationId,
      dto.items.map((item) => ({
        productId: item.itemId,
        variantId: item.variantId,
        quantity: item.quantity,
        modifierOptionIds: item.modifiers,
      })),
    );

    const orderType = this.resolveOrderType(dto.orderType);
    if (orderType === OrderType.DELIVERY) {
      this.assertDeliveryDetails(dto.delivery);
    }

    const computed = calculateOnlineTotals({ lines, orderType });
    const customer = dto.customerId
      ? await this.loyaltyService.getCustomerProfile(tenant, dto.customerId)
      : await this.loyaltyService.findOrCreateCustomer(tenant.tenantId, dto.customer);
    const redemption =
      customer && dto.loyaltyRedeemPoints
        ? await this.loyaltyService.quoteRedemption(tenant.tenantId, {
            customerId: customer.id,
            points: dto.loyaltyRedeemPoints,
            orderTotal: computed.grandTotal,
          })
        : null;
    if (redemption && !redemption.allowed) {
      throw new BadRequestException(redemption.message ?? 'Reward points cannot be redeemed');
    }

    let creditTotal = parseMoney(redemption?.discountAmount ?? '0.00');
    const remainingTotal = () => Math.max(0, parseMoney(computed.grandTotal) - creditTotal).toFixed(2);
    const giftCardCredit =
      dto.giftCardCode && dto.giftCardAmount
        ? await this.giftCardsService.quoteGiftCard(
            tenant.tenantId,
            dto.giftCardCode,
            dto.giftCardAmount,
            remainingTotal(),
          )
        : null;
    creditTotal += parseMoney(giftCardCredit?.amount ?? '0.00');
    const storeCredit =
      customer && dto.storeCreditAmount
        ? await this.giftCardsService.quoteStoreCredit(
            tenant.tenantId,
            customer.id,
            dto.storeCreditAmount,
            remainingTotal(),
          )
        : null;
    creditTotal += parseMoney(storeCredit?.amount ?? '0.00');

    const clientTotal = parseMoney(dto.totals.grandTotal);
    const serverTotal = Math.max(0, parseMoney(computed.grandTotal) - creditTotal);
    if (Math.abs(clientTotal - serverTotal) > TOTAL_TOLERANCE) {
      throw new BadRequestException('Order total does not match server calculation');
    }

    const currency = (dto.currency ?? DEFAULT_CURRENCY).toLowerCase();
    const checkoutRef = randomUUID();

    this.pendingStore.set(checkoutRef, {
      tenantId: tenant.tenantId,
      locationId: dto.locationId,
      orderType: dto.orderType,
      customer: dto.customer,
      customerId: customer?.id,
      delivery: dto.delivery,
      notes: dto.notes,
      items: dto.items.map((item) => ({
        productId: item.itemId,
        variantId: item.variantId,
        quantity: item.quantity,
        modifierOptionIds: item.modifiers,
      })),
      grandTotal: serverTotal.toFixed(2),
      currency,
      loyaltyRedeemPoints: redemption?.points,
      giftCardCode: giftCardCredit?.giftCardCode,
      giftCardAmount: giftCardCredit ? parseMoney(giftCardCredit.amount) : undefined,
      storeCreditAmount: storeCredit ? parseMoney(storeCredit.amount) : undefined,
    });

    if (!this.stripeClient.isConfigured()) {
      const placeholderUrl = `${this.stripeClient.storefrontBaseUrl()}/checkout/success?session_id=cs_placeholder_${checkoutRef}&checkout_ref=${checkoutRef}`;
      return { sessionId: `cs_placeholder_${checkoutRef}`, url: placeholderUrl };
    }

    const amountCents = Math.round(serverTotal * 100);
    const base = this.stripeClient.storefrontBaseUrl();
    const session = await this.stripeClient.client().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: amountCents,
            product_data: {
              name: 'Order payment',
              description: 'Online order',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/checkout/cancel`,
      customer_email: dto.customer.email,
      metadata: {
        tenantId: tenant.tenantId,
        checkoutRef,
        type: 'order_checkout',
        locationId: dto.locationId,
      },
    });

    const snapshot = this.pendingStore.get(checkoutRef);
    if (snapshot) {
      snapshot.stripeSessionId = session.id;
    }

    if (!session.url) {
      throw new BadRequestException('Stripe did not return a checkout URL');
    }

    return { sessionId: session.id, url: session.url };
  }

  async completeCheckoutSession(
    tenant: TenantContext,
    stripeSessionId: string,
  ): Promise<{ orderId: string; orderNumber: string | null }> {
    if (stripeSessionId.startsWith('cs_placeholder_')) {
      const checkoutRef = stripeSessionId.replace('cs_placeholder_', '');
      return this.fulfillPendingCheckout(tenant.tenantId, checkoutRef, null);
    }

    if (!this.stripeClient.isConfigured()) {
      throw new BadRequestException('Stripe is not configured');
    }

    const session = await this.stripeClient.client().checkout.sessions.retrieve(stripeSessionId, {
      expand: ['payment_intent'],
    });

    if (session.metadata?.tenantId !== tenant.tenantId) {
      throw new BadRequestException('Checkout session does not belong to this business');
    }

    if (session.payment_status !== 'paid') {
      throw new BadRequestException('Payment has not been completed');
    }

    const checkoutRef = session.metadata?.checkoutRef;
    if (!checkoutRef) {
      throw new BadRequestException('Invalid checkout session metadata');
    }

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    return this.fulfillPendingCheckout(tenant.tenantId, checkoutRef, paymentIntentId, stripeSessionId);
  }

  async handleStripeEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.succeeded':
        await this.onPaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        this.logger.warn(
          `Order payment failed: ${intent.id} tenant=${intent.metadata?.tenantId ?? 'unknown'}`,
        );
        break;
      }
      default:
        break;
    }
  }

  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    const secret = this.stripeClient.webhookSecret();
    if (!secret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }
    return this.stripeClient.client().webhooks.constructEvent(payload, signature, secret);
  }

  private async onCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    if (session.metadata?.type !== 'order_checkout') {
      return;
    }

    const tenantId = session.metadata.tenantId;
    const checkoutRef = session.metadata.checkoutRef;
    if (!tenantId || !checkoutRef) {
      return;
    }

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    try {
      await this.fulfillPendingCheckout(tenantId, checkoutRef, paymentIntentId, session.id);
    } catch (error) {
      this.logger.error(
        `Failed to fulfill checkout ${checkoutRef}: ${(error as Error).message}`,
      );
    }
  }

  private async onPaymentIntentSucceeded(intent: Stripe.PaymentIntent): Promise<void> {
    const checkoutRef = intent.metadata?.checkoutRef;
    const tenantId = intent.metadata?.tenantId;
    if (!checkoutRef || !tenantId || intent.metadata?.type !== 'order_checkout') {
      return;
    }

    const pending = this.pendingStore.get(checkoutRef);
    if (pending?.fulfilledOrderId) {
      return;
    }

    try {
      await this.fulfillPendingCheckout(tenantId, checkoutRef, intent.id);
    } catch (error) {
      this.logger.warn(`PI fulfill skipped for ${checkoutRef}: ${(error as Error).message}`);
    }
  }

  private async fulfillPendingCheckout(
    tenantId: string,
    checkoutRef: string,
    paymentIntentId: string | null,
    stripeSessionId?: string,
  ): Promise<{ orderId: string; orderNumber: string | null }> {
    const pending = this.pendingStore.get(checkoutRef);
    if (!pending) {
      throw new NotFoundException('Checkout session expired or not found');
    }

    if (pending.tenantId !== tenantId) {
      throw new BadRequestException('Checkout does not belong to this business');
    }

    if (pending.fulfilledOrderId) {
      const order = await this.ordersService.findOne(
        { tenantId, source: 'header' },
        pending.fulfilledOrderId,
      );
      return { orderId: order.id, orderNumber: order.orderNumber };
    }

    const tenant: TenantContext = { tenantId, source: 'header' };
    const createDto: CreateOrderDto = {
      locationId: pending.locationId,
      orderType: this.resolveOrderType(pending.orderType),
      paymentMethod: OrderPaymentMethod.CARD,
      customerId: pending.customerId,
      loyaltyRedeemPoints: pending.loyaltyRedeemPoints,
      giftCardCode: pending.giftCardCode,
      giftCardAmount: pending.giftCardAmount,
      storeCreditAmount: pending.storeCreditAmount,
      items: pending.items.map((line) => ({
        productId: line.productId,
        variantId: line.variantId,
        quantity: line.quantity,
        modifierOptionIds: line.modifierOptionIds,
      })),
      ...(pending.delivery && pending.orderType === OnlineOrderType.DELIVERY
        ? {
            deliveryDetails: {
              addressLine1: pending.delivery.addressLine1,
              addressLine2: pending.delivery.addressLine2,
              city: pending.delivery.city,
              postalCode: pending.delivery.postalCode,
              instructions: pending.delivery.instructions ?? pending.notes,
              contactPhone: pending.customer.phone,
            },
          }
        : {}),
    };

    const order = await this.ordersService.create(tenant, createDto);

    const paymentContext = {
      tenantId,
      orderId: order.id,
      method: OrderPaymentMethod.CARD,
      amount: pending.grandTotal,
      currency: pending.currency,
      reason: 'online_stripe_checkout',
      stripePaymentIntentId: paymentIntentId,
    };

    await this.paymentsService.createPaymentIntent(paymentContext);
    const capture = await this.paymentsService.authorizeOrCapture(paymentContext);
    if (capture.status !== 'captured') {
      throwOnlinePaymentFailed(capture.failureReason);
    }

    const updated = await this.ordersService.update(tenant, order.id, {
      status: OrderStatus.ACCEPTED,
    });

    if (createDto.orderType === OrderType.DELIVERY && pending.delivery) {
      await this.deliveryService.createTask({
        tenantId,
        orderId: order.id,
        metadata: {
          customerName: pending.customer.name,
          customerPhone: pending.customer.phone,
          deliveryAddress: pending.delivery,
        },
      });
    }

    if (stripeSessionId) {
      this.pendingStore.markFulfilled(checkoutRef, order.id, stripeSessionId);
    } else {
      this.pendingStore.markFulfilled(checkoutRef, order.id, checkoutRef);
    }

    await this.routeToFulfillment(tenantId, updated.id);

    return { orderId: updated.id, orderNumber: updated.orderNumber };
  }

  private async routeToFulfillment(tenantId: string, orderId: string): Promise<void> {
    const detail = await this.kdsOrderQuery.getOrderDetails(tenantId, orderId);
    this.kdsBroadcast.orderCreated(tenantId, detail);
  }

  private async assertLocationBelongsToTenant(
    tenantId: string,
    locationId: string,
  ): Promise<void> {
    const location = await this.locationRepository.findOne({
      where: { id: locationId, tenantId },
    });
    if (!location) {
      throw new BadRequestException('Location not found for this business');
    }
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
  ) {
    const priced = [];

    for (const item of items) {
      const product = await this.menuRepository.findProductByIdForTenant(tenantId, item.productId);
      if (
        !product ||
        product.status !== ProductStatus.ACTIVE ||
        !isOnlineChannelVisible(product.channelVisibility)
      ) {
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
      const modifierTotal = formatMoney(
        modifierOptions.reduce((sum, option) => sum + parseMoney(option.priceDelta), 0),
      );
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

  private resolveOrderType(orderType: OnlineOrderType): OrderType {
    if (orderType === OnlineOrderType.DELIVERY) {
      return OrderType.DELIVERY;
    }
    if (orderType === OnlineOrderType.PICKUP) {
      return OrderType.PICKUP;
    }
    if (orderType === OnlineOrderType.IN_STORE) {
      return OrderType.POS;
    }
    return OrderType.ONLINE;
  }

  private assertDeliveryDetails(
    delivery?: CreateCheckoutSessionDto['delivery'],
  ): asserts delivery is NonNullable<CreateCheckoutSessionDto['delivery']> {
    if (!delivery?.addressLine1?.trim() || !delivery.city?.trim()) {
      throwOnlineDeliveryAddressRequired();
    }
  }

}
