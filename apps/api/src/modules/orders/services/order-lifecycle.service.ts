import { BadRequestException, Injectable } from '@nestjs/common';
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
import {
  DeliveryService,
  InventoryService,
  NotificationsService,
  PaymentsService,
  PromotionsService,
} from '../integrations';
import { OrderEventsService } from './order-events.service';
import { OrderStatusHistoryService } from './order-status-history.service';
import { OrderTransitionContext } from '../types/order-transition.context';

@Injectable()
export class OrderLifecycleService {
  constructor(
    private readonly statusHistoryService: OrderStatusHistoryService,
    private readonly orderEventsService: OrderEventsService,
    private readonly promotionsService: PromotionsService,
    private readonly inventoryService: InventoryService,
    private readonly paymentsService: PaymentsService,
    private readonly deliveryService: DeliveryService,
    private readonly notificationsService: NotificationsService,
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

    await this.inventoryService.reserveOrDeduct(tenant, order, items, 'reserve');

    await this.notificationsService.sendOrderNotification(
      tenant,
      order,
      'order.created',
      { status: order.status },
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

    await this.runStepIntegrations(tenant, order, items, fromStatus, toStatus);

    await this.notificationsService.sendOrderNotification(
      tenant,
      order,
      'order.status_changed',
      { fromStatus, toStatus },
    );

    return order;
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

  private async runStepIntegrations(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
  ): Promise<void> {
    switch (toStatus) {
      case OrderStatus.ACCEPTED:
        await this.paymentsService.authorizeOrCapture(tenant, order);
        if (order.orderType === OrderType.DELIVERY) {
          await this.deliveryService.createTask(tenant, order);
        }
        break;

      case OrderStatus.READY:
        if (order.orderType === OrderType.DELIVERY) {
          await this.deliveryService.assignDriver(tenant, order);
        }
        break;

      case OrderStatus.DELIVERED:
        await this.paymentsService.authorizeOrCapture(tenant, order);
        await this.inventoryService.reserveOrDeduct(tenant, order, items, 'deduct');
        break;

      case OrderStatus.CANCELLED:
        await this.inventoryService.restore(tenant, order, items);
        await this.paymentsService.refund(tenant, order, ctxReason(fromStatus));
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
        await this.inventoryService.restore(tenant, order, items);
        await this.paymentsService.refund(tenant, order, 'order_failed');
        break;

      default:
        break;
    }

    void fromStatus;
  }
}

function ctxReason(fromStatus: OrderStatus): string {
  return `cancelled_from_${fromStatus}`;
}
