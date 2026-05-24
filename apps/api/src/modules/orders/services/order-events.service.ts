import { Injectable, Logger } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { OrderEventResponseDto } from '../dto';
import { OrderEntity } from '../entities/order.entity';
import { OrderReportingEventType } from '../enums/order-reporting-event-type.enum';
import { OrderEventRepository } from '../repositories/order-event.repository';
import { toOrderEventResponseDto } from '../mappers/order.mapper';
import { OrdersDomainEvents } from '../events/orders.events';
import { ReportingService } from '../integrations/reporting.service';
import { OrderTransitionContext } from '../types/order-transition.context';
import { OrderReportingContext } from '../types/order-reporting.context';

@Injectable()
export class OrderEventsService {
  private readonly logger = new Logger(OrderEventsService.name);

  constructor(
    private readonly repository: OrderEventRepository,
    private readonly reportingService: ReportingService,
  ) {}

  async findByOrderId(
    tenant: TenantContext,
    orderId: string,
    query: FilterPaginationDto,
  ): Promise<OrderEventResponseDto[]> {
    const rows = await this.repository.findByOrderId(orderId, query);
    return rows.map(toOrderEventResponseDto);
  }

  /**
   * Persists an order event to `order_events` and logs a placeholder domain bus publish.
   */
  async emit(
    tenant: TenantContext,
    orderId: string,
    eventType: string,
    metadata: Record<string, unknown>,
    ctx: OrderTransitionContext = {},
    domainEvent?: string,
    order?: OrderEntity,
  ): Promise<void> {
    await this.repository.appendEvent(orderId, eventType, metadata, ctx.manager);

    if (domainEvent && order) {
      this.logger.debug(
        `[placeholder] OrderEventsService.emit bus=${domainEvent} persisted=${eventType} orderId=${order.id} tenant=${tenant.tenantId}`,
      );
    } else {
      this.logger.debug(
        `[placeholder] OrderEventsService.emit persisted=${eventType} orderId=${orderId} tenant=${tenant.tenantId}`,
      );
    }
  }

  /**
   * Reporting/analytics placeholder — does not persist; forwards to ReportsModule stub.
   */
  emitReporting(
    context: OrderReportingContext,
    eventType: OrderReportingEventType,
    payload: Record<string, unknown>,
  ): void {
    this.reportingService.emit(context, eventType, payload);
  }

  async emitDomainStatusChange(
    tenant: TenantContext,
    order: OrderEntity,
    eventType: string,
    fromStatus: string,
    toStatus: string,
    ctx: OrderTransitionContext = {},
  ): Promise<void> {
    const domainEvent =
      toStatus === 'cancelled'
        ? OrdersDomainEvents.ORDER_CANCELLED
        : OrdersDomainEvents.ORDER_STATUS_CHANGED;

    await this.emit(
      tenant,
      order.id,
      eventType,
      { fromStatus, toStatus },
      ctx,
      domainEvent,
      order,
    );
  }
}
