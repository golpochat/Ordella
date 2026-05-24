import { BadRequestException, Injectable } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderPaymentStatus } from '../enums/order-payment-status.enum';
import { OrderNotificationType } from '../enums/order-notification-type.enum';
import {
  canTransitionOrderStatus,
  isTerminalOrderStatus,
} from '../domain/order-lifecycle.transitions';
import { orderStatusToEventType } from '../domain/order-status-event-type.mapper';
import { OrderEventTypes } from '../constants/order-events.constants';
import { InventoryService, PromotionsService } from '../integrations';
import { OrderEventsService } from './order-events.service';
import { OrderStatusHistoryService } from './order-status-history.service';
import { OrderPaymentService } from './order-payment.service';
import { OrderDeliveryService } from './order-delivery.service';
import { OrderNotificationService } from './order-notification.service';
import { OrderTransitionContext } from '../types/order-transition.context';
import { OrderInventoryContext } from '../types/order-inventory.context';
import { OrderPaymentContext } from '../types/order-payment.context';
import { OrderDeliveryContext } from '../types/order-delivery.context';

/** Business "confirmed" step — inventory deduct and payment capture run on this status. */
const CONFIRMED_STATUS = OrderStatus.ACCEPTED;

@Injectable()
export class OrderLifecycleService {
  constructor(
    private readonly statusHistoryService: OrderStatusHistoryService,
    private readonly orderEventsService: OrderEventsService,
    private readonly promotionsService: PromotionsService,
    private readonly inventoryService: InventoryService,
    private readonly orderPaymentService: OrderPaymentService,
    private readonly orderDeliveryService: OrderDeliveryService,
    private readonly orderNotificationService: OrderNotificationService,
  ) {}

  assertCanTransition(from: OrderStatus, to: OrderStatus): void {
    if (!canTransitionOrderStatus(from, to)) {
      throw new BadRequestException(
        `Cannot transition order from "${from}" to "${to}"`,
      );
    }
  }

  async onOrderCreated(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    ctx: OrderTransitionContext = {},
  ): Promise<void> {
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

    await this.inventoryService.reserve(
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
  }

  async transition(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    toStatus: OrderStatus,
    ctx: OrderTransitionContext = {},
  ): Promise<OrderEntity> {
    const fromStatus = order.status;

    if (fromStatus === toStatus) {
      return order;
    }

    if (isTerminalOrderStatus(fromStatus)) {
      throw new BadRequestException(`Order is in terminal status "${fromStatus}"`);
    }

    this.assertCanTransition(fromStatus, toStatus);

    if (toStatus === CONFIRMED_STATUS) {
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

    await this.orderNotificationService.notifyForStatus(
      tenant,
      order,
      items,
      fromStatus,
      toStatus,
    );

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

    if (toStatus === CONFIRMED_STATUS) {
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

    if (toStatus === CONFIRMED_STATUS) {
      await this.inventoryService.deduct(inventoryCtx);
      return;
    }

    if (toStatus === OrderStatus.CANCELLED) {
      await this.inventoryService.releaseOrRestore(inventoryCtx);
      return;
    }

    if (toStatus === OrderStatus.REFUNDED) {
      await this.inventoryService.restoreForRefund(inventoryCtx);
      return;
    }

    if (toStatus === OrderStatus.FAILED) {
      await this.inventoryService.releaseOrRestore(inventoryCtx);
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
        await this.promotionsService.applyPromotions({
          tenant,
          order,
          items,
          lines: [],
          draftTotals: {
            subtotal: order.subtotal,
            discountTotal: '0.00',
            taxTotal: order.tax,
            serviceChargeTotal: '0.00',
            deliveryFee: '0.00',
            grandTotal: order.total,
            promotionIds: [],
            appliedPromotions: [],
          },
          action: 'void',
        });
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
