import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderRepository } from '../repositories/order.repository';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { OrderPricingService } from './order-pricing.service';
import { CalculatedLineItem, mapDraftTotalsToOrderColumns } from '../types/draft-order.types';
import { parseMoney } from '../domain/order-totals.util';

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
    const lines = this.mapItemsToCalculatedLines(items);

    const context = this.orderPricingService.buildPricingContext(
      { tenantId, source: 'jwt' },
      order.locationId,
      order.orderType,
    );

    const draftTotals = this.orderPricingService.calculateOrderTotals(lines, context);
    const finalTotals = await this.orderPricingService.applyPromotionsAndRecalculate(
      context,
      draftTotals,
      lines,
      items,
      order,
    );

    const columns = mapDraftTotalsToOrderColumns(finalTotals);
    order.subtotal = columns.subtotal;
    order.tax = columns.tax;
    order.total = columns.total;

    return this.orderRepository.save(order, manager);
  }

  private mapItemsToCalculatedLines(items: OrderItemEntity[]): CalculatedLineItem[] {
    return items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: item.price,
      modifierTotal: '0.00',
      unitPriceWithModifiers: item.price,
      lineSubtotal: (parseMoney(item.price) * item.quantity).toFixed(2),
      lineTax: '0.00',
      lineDiscount: '0.00',
      notes: item.notes,
      modifiers: [],
    }));
  }
}
