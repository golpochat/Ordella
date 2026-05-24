import { Injectable } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { OrderStatusHistoryResponseDto } from '../dto';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderStatusHistoryRepository } from '../repositories/order-status-history.repository';
import { toOrderStatusHistoryResponseDto } from '../mappers/order.mapper';
import { OrderTransitionContext } from '../types/order-transition.context';

@Injectable()
export class OrderStatusHistoryService {
  constructor(private readonly repository: OrderStatusHistoryRepository) {}

  async findByOrderId(
    tenant: TenantContext,
    orderId: string,
    query: FilterPaginationDto,
  ): Promise<OrderStatusHistoryResponseDto[]> {
    const rows = await this.repository.findByOrderId(orderId, query);
    return rows.map(toOrderStatusHistoryResponseDto);
  }

  async recordTransition(
    _tenant: TenantContext,
    orderId: string,
    fromStatus: OrderStatus | null,
    toStatus: OrderStatus,
    ctx: OrderTransitionContext = {},
  ): Promise<void> {
    await this.repository.appendTransition(
      orderId,
      fromStatus,
      toStatus,
      ctx.changedBy ?? null,
      ctx.reason ?? null,
      ctx.manager,
    );
  }
}
