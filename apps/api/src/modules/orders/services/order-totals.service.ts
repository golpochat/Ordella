import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { OrderRepository } from '../repositories/order.repository';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { OrderPricingService } from './order-pricing.service';
import { CalculatedLineItem } from '../types/draft-order.types';

@Injectable()
export class OrderTotalsService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly orderPricingService: OrderPricingService,
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
    const lines: CalculatedLineItem[] = items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.price,
      lineSubtotal: (Number(item.price) * item.quantity).toFixed(2),
      notes: item.notes,
    }));

    const totals = this.orderPricingService.calculateOrderTotals(lines);
    order.subtotal = totals.subtotal;
    order.tax = totals.tax;
    order.total = totals.total;

    return this.orderRepository.save(order, manager);
  }
}
