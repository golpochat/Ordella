import { Injectable, Logger } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { OrderEventResponseDto } from '../dto';
import { OrderEntity } from '../entities/order.entity';
import { OrderEventRepository } from '../repositories/order-event.repository';
import { toOrderEventResponseDto } from '../mappers/order.mapper';
import { OrderTransitionContext } from './order-lifecycle.service';

@Injectable()
export class OrderEventsService {
  private readonly logger = new Logger(OrderEventsService.name);

  constructor(private readonly repository: OrderEventRepository) {}

  async findByOrderId(
    tenant: TenantContext,
    orderId: string,
    query: FilterPaginationDto,
  ): Promise<OrderEventResponseDto[]> {
    const rows = await this.repository.findByOrderId(orderId, query);
    return rows.map(toOrderEventResponseDto);
  }

  async recordEvent(
    _tenant: TenantContext,
    orderId: string,
    eventType: string,
    metadata: Record<string, unknown>,
    ctx: OrderTransitionContext = {},
  ): Promise<void> {
    await this.repository.appendEvent(orderId, eventType, metadata, ctx.manager);
  }

  /** Placeholder for RabbitMQ / internal event bus publish. */
  recordDomainEvent(
    domainEvent: string,
    order: OrderEntity,
    payload: Record<string, unknown> = {},
  ): void {
    this.logger.debug(
      `[placeholder] publish ${domainEvent} orderId=${order.id} payload=${JSON.stringify(payload)}`,
    );
  }
}
