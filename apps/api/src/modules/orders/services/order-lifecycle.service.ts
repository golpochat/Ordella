import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderType } from '../enums/order-type.enum';
import {
  canTransitionOrderStatus,
  isTerminalOrderStatus,
} from '../domain/order-lifecycle.transitions';
import { orderStatusToEventType } from '../domain/order-status-event-type.mapper';
import { OrderEventTypes } from '../constants/order-events.constants';
import { OrdersDomainEvents } from '../events/orders.events';
import {
  OrderDeliveryHook,
  OrderInventoryHook,
  OrderNotificationHook,
  OrderPaymentHook,
  OrderPromotionHook,
  OrderReportingHook,
} from '../hooks';
import { OrderEventsService } from './order-events.service';
import { OrderStatusHistoryService } from './order-status-history.service';

export interface OrderTransitionContext {
  changedBy?: string | null;
  reason?: string | null;
  manager?: EntityManager;
}

@Injectable()
export class OrderLifecycleService {
  constructor(
    private readonly statusHistoryService: OrderStatusHistoryService,
    private readonly orderEventsService: OrderEventsService,
    private readonly promotionHook: OrderPromotionHook,
    private readonly inventoryHook: OrderInventoryHook,
    private readonly paymentHook: OrderPaymentHook,
    private readonly deliveryHook: OrderDeliveryHook,
    private readonly notificationHook: OrderNotificationHook,
    private readonly reportingHook: OrderReportingHook,
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
    await this.statusHistoryService.recordTransition(
      tenant,
      order.id,
      null,
      OrderStatus.PENDING,
      ctx,
    );
    await this.orderEventsService.recordEvent(
      tenant,
      order.id,
      OrderEventTypes.CREATED,
      { orderNumber: order.orderNumber, total: order.total },
      ctx,
    );
    await this.orderEventsService.recordDomainEvent(
      OrdersDomainEvents.ORDER_CREATED,
      order,
    );

    await this.promotionHook.applyOnOrderCreated(tenant, order, items);
    await this.inventoryHook.reserveSoft(tenant, order, items);
    await this.notificationHook.onOrderCreated(tenant, order);
    await this.reportingHook.emitOrderCreated(tenant, order);
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

    order.status = toStatus;

    await this.statusHistoryService.recordTransition(
      tenant,
      order.id,
      fromStatus,
      toStatus,
      ctx,
    );

    const eventType = orderStatusToEventType(toStatus);
    await this.orderEventsService.recordEvent(
      tenant,
      order.id,
      eventType,
      { fromStatus, toStatus },
      ctx,
    );
    await this.orderEventsService.recordDomainEvent(
      toStatus === OrderStatus.CANCELLED
        ? OrdersDomainEvents.ORDER_CANCELLED
        : OrdersDomainEvents.ORDER_STATUS_CHANGED,
      order,
      { fromStatus, toStatus },
    );

    await this.runEnterHooks(tenant, order, items, fromStatus, toStatus);
    await this.notificationHook.onStatusChanged(tenant, order, fromStatus, toStatus);
    await this.reportingHook.emitStatusChanged(tenant, order, fromStatus, toStatus);

    return order;
  }

  private async runEnterHooks(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
  ): Promise<void> {
    switch (toStatus) {
      case OrderStatus.ACCEPTED:
        await this.paymentHook.requestConfirmation(tenant, order);
        break;
      case OrderStatus.READY:
        if (order.orderType === OrderType.DELIVERY) {
          await this.deliveryHook.assignForOrder(tenant, order);
        }
        break;
      case OrderStatus.DELIVERED:
        await this.paymentHook.confirmPayment(tenant, order);
        await this.inventoryHook.commitReservations(tenant, order);
        await this.reportingHook.emitOrderCompleted(tenant, order);
        break;
      case OrderStatus.CANCELLED:
        await this.inventoryHook.releaseReservations(tenant, order);
        await this.promotionHook.voidOnOrderCancelled(tenant, order);
        break;
      case OrderStatus.FAILED:
        await this.paymentHook.markPaymentFailed(tenant, order);
        await this.inventoryHook.releaseReservations(tenant, order);
        break;
      default:
        break;
    }

    void items;
    void fromStatus;
  }
}
