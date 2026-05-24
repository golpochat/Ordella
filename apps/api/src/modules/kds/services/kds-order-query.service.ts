import { Injectable } from '@nestjs/common';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import {
  KdsOrderQueryRepository,
  KDS_DEFAULT_ACTIVE_STATUSES,
} from '../repositories/kds-order-query.repository';
import { KdsOrderItemStateRepository } from '../repositories/kds-order-item-state.repository';
import { mapKdsOrderDetail, mapKdsOrderSummary } from '../mappers/kds-order.mapper';
import { throwKdsOrderNotFound } from '../domain/kds-domain.errors';
import { KdsOrderDetailView, KdsOrderSummaryView } from '../types/kds-order.views';

@Injectable()
export class KdsOrderQueryService {
  constructor(
    private readonly orderQueryRepository: KdsOrderQueryRepository,
    private readonly itemStateRepository: KdsOrderItemStateRepository,
  ) {}

  async getActiveOrders(
    tenantId: string,
    station?: string,
    status?: OrderStatus,
  ): Promise<KdsOrderSummaryView[]> {
    const statuses = status ? [status] : [...KDS_DEFAULT_ACTIVE_STATUSES];
    const orders = await this.orderQueryRepository.findActiveOrdersForTenant(
      tenantId,
      statuses,
      station,
    );

    const views: KdsOrderSummaryView[] = [];
    for (const order of orders) {
      const states = await this.itemStateRepository.ensurePendingForItems(
        tenantId,
        order.id,
        (order.items ?? []).map((item) => item.id),
      );
      views.push(mapKdsOrderSummary(order, states));
    }

    return views;
  }

  async getOrderDetails(tenantId: string, orderId: string): Promise<KdsOrderDetailView> {
    const order = await this.orderQueryRepository.findOrderWithItemsForTenant(tenantId, orderId);
    if (!order) {
      throwKdsOrderNotFound(orderId);
    }

    const states = await this.itemStateRepository.ensurePendingForItems(
      tenantId,
      order.id,
      (order.items ?? []).map((item) => item.id),
    );

    return mapKdsOrderDetail(order, states);
  }
}
