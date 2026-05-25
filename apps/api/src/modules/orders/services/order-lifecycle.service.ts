import { Injectable } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderPaymentStatus } from '../enums/order-payment-status.enum';
import { OrderNotificationType } from '../enums/order-notification-type.enum';
import { assertOrderStatusTransition } from '../domain/order-lifecycle.transitions';
import { ORDER_CONFIRMED_STATUS } from '../domain/order-lifecycle.constants';
import {
  assertNotTransitioningFromTerminal,
  resolveStatusTransition,
} from '../domain/order-lifecycle.idempotency';
import {
  assertOrderHasItems,
  assertOrderTenantScope,
} from '../domain/order-lifecycle.validation';
import { orderStatusToEventType } from '../domain/order-status-event-type.mapper';
import { OrderEventTypes } from '../constants/order-events.constants';
import { OrderEventsService } from './order-events.service';
import { OrderStatusHistoryService } from './order-status-history.service';
import { OrderPaymentService } from './order-payment.service';
import { OrderDeliveryService } from './order-delivery.service';
import { OrderNotificationService } from './order-notification.service';
import { OrderReportingService } from './order-reporting.service';
import { OrderInventoryService } from './order-inventory.service';
import { OrderPromotionsService } from './order-promotions.service';
import { OrderReportingEventType } from '../enums/order-reporting-event-type.enum';
import { buildOrderReportingPayload } from '../domain/order-reporting-payload.util';
import { OrderTransitionContext } from '../types/order-transition.context';
import { OrderInventoryContext } from '../types/order-inventory.context';
import { OrderPaymentContext } from '../types/order-payment.context';
import { OrderDeliveryContext } from '../types/order-delivery.context';
import { LoyaltyService } from '../../loyalty/services';
import { GiftCardsService } from '../../giftcards/services';

@Injectable()
export class OrderLifecycleService {
  constructor(
    private readonly statusHistoryService: OrderStatusHistoryService,
    private readonly orderEventsService: OrderEventsService,
    private readonly orderInventoryService: OrderInventoryService,
    private readonly orderPromotionsService: OrderPromotionsService,
    private readonly orderPaymentService: OrderPaymentService,
    private readonly orderDeliveryService: OrderDeliveryService,
    private readonly orderNotificationService: OrderNotificationService,
    private readonly orderReportingService: OrderReportingService,
    private readonly loyaltyService: LoyaltyService,
    private readonly giftCardsService: GiftCardsService,
  ) {}

  assertCanTransition(from: OrderStatus, to: OrderStatus): void {
    assertOrderStatusTransition(from, to);
  }

  async onOrderCreated(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    ctx: OrderTransitionContext = {},
  ): Promise<void> {
    assertOrderTenantScope(order, tenant.tenantId);
    assertOrderHasItems(items);

    order.paymentStatus = OrderPaymentStatus.UNPAID;

    await this.recordStatusChange(tenant, order.id, null, OrderStatus.PENDING, ctx);

    await this.orderEventsService.emit(
      tenant,
      order.id,
      OrderEventTypes.CREATED,
      { orderNumber: order.orderNumber, total: order.total, subtotal: order.subtotal },
      ctx,
      'orders.order.created',
      order,
    );

    await this.orderInventoryService.reserve(
      this.buildInventoryContext(tenant, order, items, null, OrderStatus.PENDING),
    );

    await this.orderNotificationService.notify(
      this.orderNotificationService.buildContext(
        tenant,
        order,
        items,
        null,
        OrderStatus.PENDING,
        OrderNotificationType.ORDER_CREATED,
      ),
      OrderNotificationType.ORDER_CREATED,
    );

    this.orderReportingService.emit(
      this.orderReportingService.buildContext(
        tenant,
        order,
        items,
        null,
        OrderStatus.PENDING,
        OrderReportingEventType.ORDER_CREATED,
      ),
      OrderReportingEventType.ORDER_CREATED,
      buildOrderReportingPayload(order, items, null, OrderStatus.PENDING),
    );
  }

  async transition(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    toStatus: OrderStatus,
    ctx: OrderTransitionContext = {},
  ): Promise<OrderEntity> {
    assertOrderTenantScope(order, tenant.tenantId);
    assertOrderHasItems(items);

    const fromStatus = order.status;

    if (resolveStatusTransition(fromStatus, toStatus) === 'noop') {
      return order;
    }

    assertNotTransitioningFromTerminal(fromStatus, toStatus);
    this.assertCanTransition(fromStatus, toStatus);

    if (toStatus === ORDER_CONFIRMED_STATUS) {
      await this.runPaymentForTransition(tenant, order, items, fromStatus, toStatus);
    }

    order.status = toStatus;

    await this.recordStatusChange(tenant, order.id, fromStatus, toStatus, ctx);

    const eventType = orderStatusToEventType(toStatus);
    await this.orderEventsService.emitDomainStatusChange(
      tenant,
      order,
      eventType,
      fromStatus,
      toStatus,
      ctx,
    );

    await this.runInventoryForTransition(tenant, order, items, fromStatus, toStatus);
    await this.runDeliveryForTransition(tenant, order, items, fromStatus, toStatus);

    if (toStatus === OrderStatus.REFUNDED) {
      await this.runPaymentForTransition(tenant, order, items, fromStatus, toStatus);
    }

    await this.runNonInventoryIntegrations(tenant, order, items, fromStatus, toStatus);

    if (toStatus === OrderStatus.COMPLETED) {
      await this.loyaltyService.earnForCompletedOrder(tenant, order);
    }

    if (toStatus === OrderStatus.REFUNDED) {
      await this.giftCardsService.restoreCreditsForRefund(tenant, order);
    }

    await this.orderNotificationService.notifyForStatus(
      tenant,
      order,
      items,
      fromStatus,
      toStatus,
    );

    this.orderReportingService.emitForStatus(tenant, order, items, fromStatus, toStatus);

    return order;
  }

  private buildInventoryContext(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    fromStatus: OrderStatus | null,
    toStatus: OrderStatus,
  ): OrderInventoryContext {
    return { tenant, order, items, fromStatus, toStatus };
  }

  private buildPaymentContext(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    fromStatus: OrderStatus | null,
    toStatus: OrderStatus,
    reason?: string,
  ): OrderPaymentContext {
    return {
      tenant,
      order,
      items,
      fromStatus,
      toStatus,
      paymentMethod: order.paymentMethod,
      reason,
    };
  }

  private async runPaymentForTransition(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
  ): Promise<void> {
    const paymentCtx = this.buildPaymentContext(tenant, order, items, fromStatus, toStatus);

    if (toStatus === ORDER_CONFIRMED_STATUS) {
      await this.orderPaymentService.confirmOnAccepted(paymentCtx, order);
      return;
    }

    if (toStatus === OrderStatus.REFUNDED) {
      await this.orderPaymentService.refundOnRefunded(paymentCtx, order);
    }
  }

  private buildDeliveryContext(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
  ): OrderDeliveryContext {
    return { tenant, order, items, fromStatus, toStatus };
  }

  private async runDeliveryForTransition(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
  ): Promise<void> {
    const deliveryCtx = this.buildDeliveryContext(
      tenant,
      order,
      items,
      fromStatus,
      toStatus,
    );

    if (toStatus === OrderStatus.READY) {
      await this.orderDeliveryService.onOrderReady(deliveryCtx, order);
      return;
    }

    if (toStatus === OrderStatus.OUT_FOR_DELIVERY) {
      await this.orderDeliveryService.onOutForDelivery(deliveryCtx);
      return;
    }

    if (toStatus === OrderStatus.COMPLETED) {
      await this.orderDeliveryService.onCompleted(deliveryCtx);
    }
  }

  private async runInventoryForTransition(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
  ): Promise<void> {
    const inventoryCtx = this.buildInventoryContext(
      tenant,
      order,
      items,
      fromStatus,
      toStatus,
    );

    if (toStatus === ORDER_CONFIRMED_STATUS) {
      await this.orderInventoryService.deduct(inventoryCtx);
      return;
    }

    if (toStatus === OrderStatus.CANCELLED) {
      await this.orderInventoryService.releaseOrRestore(inventoryCtx);
      return;
    }

    if (toStatus === OrderStatus.REFUNDED) {
      await this.orderInventoryService.restoreForRefund(inventoryCtx);
      return;
    }

    if (toStatus === OrderStatus.FAILED) {
      await this.orderInventoryService.releaseOrRestore(inventoryCtx);
    }
  }

  private async runNonInventoryIntegrations(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
  ): Promise<void> {
    switch (toStatus) {
      case OrderStatus.CANCELLED:
        await this.orderPaymentService.refundOnCancelled(
          this.buildPaymentContext(
            tenant,
            order,
            items,
            fromStatus,
            toStatus,
            ctxReason(fromStatus),
          ),
          order,
        );
        await this.orderPromotionsService.voidOnCancel(tenant, order, items);
        break;

      case OrderStatus.FAILED:
        await this.orderPaymentService.refundOnCancelled(
          this.buildPaymentContext(tenant, order, items, fromStatus, toStatus, 'order_failed'),
          order,
        );
        break;

      default:
        break;
    }

    void fromStatus;
  }

  private async recordStatusChange(
    tenant: TenantContext,
    orderId: string,
    fromStatus: OrderStatus | null,
    toStatus: OrderStatus,
    ctx: OrderTransitionContext,
  ): Promise<void> {
    await this.statusHistoryService.recordTransition(
      tenant,
      orderId,
      fromStatus,
      toStatus,
      ctx,
    );
  }
}

function ctxReason(fromStatus: OrderStatus): string {
  return `cancelled_from_${fromStatus}`;
}
