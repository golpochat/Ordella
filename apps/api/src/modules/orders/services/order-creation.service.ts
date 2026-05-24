import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { TenantContext, AuthenticatedUser } from '../../../common/interfaces';
import { CreateOrderDto } from '../dto';
import { OrderResponseDto } from '../dto';
import { OrderStatus } from '../enums/order-status.enum';
import { generateOrderNumber } from '../domain/order-number.util';
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/order-item.entity';
import { toOrderResponseDto } from '../mappers/order.mapper';
import { OrderRepository } from '../repositories/order.repository';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { OrderPricingService } from './order-pricing.service';
import { OrderLifecycleService } from './order-lifecycle.service';
import { PromotionsService } from '../integrations/promotions.service';
import { CalculatedLineItem } from '../types/draft-order.types';
import { OrderTransitionContext } from '../types/order-transition.context';

@Injectable()
export class OrderCreationService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly orderPricingService: OrderPricingService,
    private readonly promotionsService: PromotionsService,
    private readonly orderLifecycleService: OrderLifecycleService,
  ) {}

  async createOrder(
    tenant: TenantContext,
    dto: CreateOrderDto,
    user?: AuthenticatedUser,
  ): Promise<OrderResponseDto> {
    const lines = await this.orderPricingService.calculateLineItemsFromDto(tenant, dto.items);
    const draftTotals = this.orderPricingService.calculateOrderTotals(lines);

    const saved = await this.dataSource.transaction(async (manager) => {
      const ctx: OrderTransitionContext = { changedBy: user?.id ?? null, manager };

      const order = this.orderRepository.create(
        {
          tenantId: tenant.tenantId,
          locationId: dto.locationId,
          customerId: dto.customerId ?? null,
          orderType: dto.orderType,
          status: OrderStatus.PENDING,
          subtotal: draftTotals.subtotal,
          tax: draftTotals.tax,
          total: draftTotals.total,
          orderNumber: generateOrderNumber(),
        },
        manager,
      );
      const persistedOrder = await this.orderRepository.save(order, manager);
      const items = await this.persistLineItems(persistedOrder.id, lines, manager);
      persistedOrder.items = items;

      await this.applyPromotionsAndPersistTotals(tenant, persistedOrder, items, lines, manager);
      await this.orderLifecycleService.onOrderCreated(tenant, persistedOrder, items, ctx);

      return persistedOrder;
    });

    const withItems = await this.orderRepository.findByIdWithItems(tenant.tenantId, saved.id);
    return toOrderResponseDto(withItems!, true);
  }

  private async applyPromotionsAndPersistTotals(
    tenant: TenantContext,
    order: OrderEntity,
    items: OrderItemEntity[],
    lines: CalculatedLineItem[],
    manager: EntityManager,
  ): Promise<void> {
    const draftTotals = this.orderPricingService.calculateOrderTotals(lines);
    const promotionResult = await this.promotionsService.applyPromotions({
      tenant,
      order,
      items,
      draftTotals,
      action: 'apply',
    });

    const finalTotals = this.orderPricingService.applyDiscountToDraft(
      draftTotals,
      promotionResult.discountAmount,
      promotionResult.promotionIds,
    );

    order.subtotal = finalTotals.subtotal;
    order.tax = finalTotals.tax;
    order.total = finalTotals.total;
    await this.orderRepository.save(order, manager);
  }

  private async persistLineItems(
    orderId: string,
    lines: CalculatedLineItem[],
    manager: EntityManager,
  ): Promise<OrderItemEntity[]> {
    const items: OrderItemEntity[] = [];

    for (const line of lines) {
      const item = this.orderItemRepository.create(
        {
          orderId,
          productId: line.productId,
          variantId: line.variantId,
          quantity: line.quantity,
          price: line.unitPrice,
          notes: line.notes,
        },
        manager,
      );
      items.push(await this.orderItemRepository.save(item, manager));
    }

    return items;
  }
}
