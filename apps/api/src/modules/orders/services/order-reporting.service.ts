import { Injectable } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderReportingEventType } from '../enums/order-reporting-event-type.enum';
import { orderStatusToReportingEventType } from '../domain/order-reporting-type.mapper';
import { buildOrderReportingPayload } from '../domain/order-reporting-payload.util';
import { OrderEventsService } from './order-events.service';
import { OrderReportingContext } from '../types/order-reporting.context';

/** Orders-domain reporting orchestration — delegates to reporting placeholders. */
@Injectable()
export class OrderReportingService {
  constructor(private readonly orderEventsService: OrderEventsService) {}

  buildContext(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    fromStatus: OrderStatus | null,
    toStatus: OrderStatus,
    eventType: OrderReportingEventType,
  ): OrderReportingContext {
    return { tenant, order, items, fromStatus, toStatus, eventType };
  }

  emitForStatus(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    fromStatus: OrderStatus | null,
    toStatus: OrderStatus,
  ): void {
    const eventType = orderStatusToReportingEventType(toStatus);
    if (!eventType) {
      return;
    }

    const payload = buildOrderReportingPayload(order, items, fromStatus, toStatus);
    const context = this.buildContext(tenant, order, items, fromStatus, toStatus, eventType);
    this.orderEventsService.emitReporting(context, eventType, payload);
  }

  emit(
    context: OrderReportingContext,
    eventType: OrderReportingEventType,
    payload: Record<string, unknown>,
  ): void {
    this.orderEventsService.emitReporting(context, eventType, payload);
  }
}
