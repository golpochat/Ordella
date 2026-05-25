import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { TenantContext, AuthenticatedUser } from '../../../common/interfaces';
import { CreateOrderDto } from '../dto';
import { OrderResponseDto } from '../dto';
import { OrderStatus } from '../enums/order-status.enum';
import { ORDER_CONFIRMED_STATUS } from '../domain/order-lifecycle.constants';
import { assertValidLineQuantity } from '../domain/order-lifecycle.validation';
import { throwOrderMissingItems } from '../domain/order-domain.errors';
import { OrderPaymentStatus } from '../enums/order-payment-status.enum';
import { generateOrderNumber } from '../domain/order-number.util';
import { isImmediatePaymentMethod } from '../domain/order-payment.util';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { toOrderResponseDto } from '../mappers/order.mapper';
import { OrderRepository } from '../repositories/order.repository';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { OrderPricingService } from './order-pricing.service';
import { OrderLifecycleService } from './order-lifecycle.service';
import { OrderDeliveryService } from './order-delivery.service';
import { OrderType } from '../enums/order-type.enum';
import {
  CalculatedLineItem,
  DraftOrderTotals,
  mapDraftTotalsToOrderColumns,
} from '../types/draft-order.types';
import { OrderTransitionContext } from '../types/order-transition.context';
import { LoyaltyService } from '../../loyalty/services';
import { GiftCardsService } from '../../giftcards/services';
import { formatMoney, parseMoney } from '../domain/order-totals.util';

@Injectable()
export class OrderCreationService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly orderPricingService: OrderPricingService,
    private readonly orderLifecycleService: OrderLifecycleService,
    private readonly orderDeliveryService: OrderDeliveryService,
    private readonly loyaltyService: LoyaltyService,
    private readonly giftCardsService: GiftCardsService,
  ) {}

  async createOrder(
    tenant: TenantContext,
    dto: CreateOrderDto,
    user?: AuthenticatedUser,
  ): Promise<OrderResponseDto> {
    if (!dto.items?.length) {
      throwOrderMissingItems();
    }

    for (const item of dto.items) {
      assertValidLineQuantity(item.quantity);
    }

    const pricingContext = this.orderPricingService.buildPricingContext(
      tenant,
      dto.locationId,
      dto.orderType,
    );

    const lines = await this.orderPricingService.calculateLineItemsFromDto(
      tenant,
      dto.items,
      pricingContext,
    );

    this.orderDeliveryService.assertDeliveryDetailsForCreate(
      dto.orderType,
      dto.deliveryDetails,
    );

    const deliveryDetails =
      dto.orderType === OrderType.DELIVERY && dto.deliveryDetails
        ? this.orderDeliveryService.toDeliveryDetailsSnapshot(dto.deliveryDetails)
        : null;

    const baseTotals = this.orderPricingService.calculateOrderTotals(lines, pricingContext);
    const loyaltyRedemption =
      dto.customerId && dto.loyaltyRedeemPoints
        ? await this.loyaltyService.quoteRedemption(tenant.tenantId, {
            customerId: dto.customerId,
            points: dto.loyaltyRedeemPoints,
            orderTotal: baseTotals.grandTotal,
          })
        : null;

    if (loyaltyRedemption && !loyaltyRedemption.allowed) {
      throw new BadRequestException(loyaltyRedemption.message ?? 'Reward points cannot be redeemed');
    }

    let creditTotal = parseMoney(loyaltyRedemption?.discountAmount ?? '0.00');
    const remainingAfterLoyalty = () =>
      formatMoney(Math.max(0, parseMoney(baseTotals.grandTotal) - creditTotal));
    const giftCardCredit =
      dto.giftCardCode && dto.giftCardAmount
        ? await this.giftCardsService.quoteGiftCard(
            tenant.tenantId,
            dto.giftCardCode,
            dto.giftCardAmount,
            remainingAfterLoyalty(),
          )
        : null;
    creditTotal += parseMoney(giftCardCredit?.amount ?? '0.00');

    if (dto.storeCreditAmount && !dto.customerId) {
      throw new BadRequestException('Customer is required to use store credit');
    }
    const storeCredit =
      dto.customerId && dto.storeCreditAmount
        ? await this.giftCardsService.quoteStoreCredit(
            tenant.tenantId,
            dto.customerId,
            dto.storeCreditAmount,
            remainingAfterLoyalty(),
          )
        : null;
    creditTotal += parseMoney(storeCredit?.amount ?? '0.00');

    const draftTotals =
      creditTotal > 0
        ? this.orderPricingService.calculateOrderTotals(lines, pricingContext, {
            discountTotal: formatMoney(creditTotal),
          })
        : baseTotals;

    const saved = await this.dataSource.transaction(async (manager) => {
      const ctx: OrderTransitionContext = { changedBy: user?.id ?? null, manager };

      const columns = mapDraftTotalsToOrderColumns(draftTotals);
      const order = this.orderRepository.create(
        {
          tenantId: tenant.tenantId,
          locationId: dto.locationId,
          customerId: dto.customerId ?? null,
          orderType: dto.orderType,
          status: OrderStatus.PENDING,
          paymentStatus: OrderPaymentStatus.UNPAID,
          paymentMethod: dto.paymentMethod ?? null,
          subtotal: columns.subtotal,
          tax: columns.tax,
          total: columns.total,
          orderNumber: generateOrderNumber(),
          deliveryDetails,
        },
        manager,
      );
      const persistedOrder = await this.orderRepository.save(order, manager);
      const items = await this.persistLineItems(persistedOrder.id, lines, manager);
      persistedOrder.items = items;

      if (dto.customerId && loyaltyRedemption?.allowed) {
        await this.loyaltyService.redeemForOrder(
          tenant.tenantId,
          dto.customerId,
          loyaltyRedemption.points,
          persistedOrder.id,
        );
      }

      if (giftCardCredit?.giftCardId) {
        await this.giftCardsService.applyGiftCardRedemption(
          tenant.tenantId,
          giftCardCredit.giftCardId,
          giftCardCredit.amount,
          persistedOrder.id,
        );
      }

      if (dto.customerId && storeCredit) {
        await this.giftCardsService.applyStoreCreditRedemption(
          tenant.tenantId,
          dto.customerId,
          storeCredit.amount,
          persistedOrder.id,
        );
      }

      await this.applyPromotionsAndUpdateOrder(
        pricingContext,
        persistedOrder,
        items,
        lines,
        draftTotals,
        manager,
      );

      await this.orderLifecycleService.onOrderCreated(tenant, persistedOrder, items, ctx);

      if (isImmediatePaymentMethod(dto.paymentMethod)) {
        await this.orderLifecycleService.transition(
          tenant,
          persistedOrder,
          items,
          ORDER_CONFIRMED_STATUS,
          ctx,
        );
        await this.orderRepository.save(persistedOrder, manager);
      }

      return persistedOrder;
    });

    const withItems = await this.orderRepository.findByIdWithItems(tenant.tenantId, saved.id);
    return toOrderResponseDto(withItems!, true);
  }

  private async applyPromotionsAndUpdateOrder(
    pricingContext: ReturnType<OrderPricingService['buildPricingContext']>,
    order: OrderEntity,
    items: OrderItemEntity[],
    lines: CalculatedLineItem[],
    draftTotals: DraftOrderTotals,
    manager: EntityManager,
  ): Promise<DraftOrderTotals> {
    const finalTotals = await this.orderPricingService.applyPromotionsAndRecalculate(
      pricingContext,
      draftTotals,
      lines,
      items,
      order,
    );

    const columns = mapDraftTotalsToOrderColumns(finalTotals);
    order.subtotal = columns.subtotal;
    order.tax = columns.tax;
    order.total = columns.total;
    await this.orderRepository.save(order, manager);

    return finalTotals;
  }

  private async persistLineItems(
    orderId: string,
    lines: CalculatedLineItem[],
    manager: EntityManager,
  ): Promise<OrderItemEntity[]> {
    const items: OrderItemEntity[] = [];

    for (const line of lines) {
      const item = this.orderItemRepository.create(
        {
          orderId,
          productId: line.productId,
          variantId: line.variantId,
          bundleId: line.bundleId ?? null,
          quantity: line.quantity,
          price: line.unitPriceWithModifiers,
          notes: line.notes,
        },
        manager,
      );
      items.push(await this.orderItemRepository.save(item, manager));
    }

    return items;
  }
}
