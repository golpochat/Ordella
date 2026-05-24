import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DEFAULT_ORDER_TAX_RATE } from '../constants/order-tax.constants';
import { calculateOrderTotals } from '../domain/order-totals.util';
import { OrderEntity } from '../entities/order.entity';
import { OrderRepository } from '../repositories/order.repository';
import { OrderItemRepository } from '../repositories/order-item.repository';

@Injectable()
export class OrderTotalsService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
  ) {}

  async recalculateForOrder(
    tenantId: string,
    orderId: string,
    manager?: EntityManager,
  ): Promise<OrderEntity> {
    const order = await this.orderRepository.findByIdForTenant(tenantId, orderId, manager);
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const items = await this.orderItemRepository.findByOrderId(orderId, manager);
    const totals = calculateOrderTotals(items, DEFAULT_ORDER_TAX_RATE);

    order.subtotal = totals.subtotal;
    order.tax = totals.tax;
    order.total = totals.total;

    return this.orderRepository.save(order, manager);
  }
}
