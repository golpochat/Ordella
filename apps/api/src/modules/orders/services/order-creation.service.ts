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
import {
  CalculatedLineItem,
  DraftOrderTotals,
  mapDraftTotalsToOrderColumns,
} from '../types/draft-order.types';
import { OrderTransitionContext } from '../types/order-transition.context';

@Injectable()
export class OrderCreationService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly orderPricingService: OrderPricingService,
    private readonly orderLifecycleService: OrderLifecycleService,
  ) {}

  async createOrder(
    tenant: TenantContext,
    dto: CreateOrderDto,
    user?: AuthenticatedUser,
  ): Promise<OrderResponseDto> {
    const pricingContext = this.orderPricingService.buildPricingContext(
      tenant,
      dto.locationId,
      dto.orderType,
    );

    const lines = await this.orderPricingService.calculateLineItemsFromDto(
      tenant,
      dto.items,
      pricingContext,
    );

    const draftTotals = this.orderPricingService.calculateOrderTotals(lines, pricingContext);

    const saved = await this.dataSource.transaction(async (manager) => {
      const ctx: OrderTransitionContext = { changedBy: user?.id ?? null, manager };

      const columns = mapDraftTotalsToOrderColumns(draftTotals);
      const order = this.orderRepository.create(
        {
          tenantId: tenant.tenantId,
          locationId: dto.locationId,
          customerId: dto.customerId ?? null,
          orderType: dto.orderType,
          status: OrderStatus.PENDING,
          subtotal: columns.subtotal,
          tax: columns.tax,
          total: columns.total,
          orderNumber: generateOrderNumber(),
        },
        manager,
      );
      const persistedOrder = await this.orderRepository.save(order, manager);
      const items = await this.persistLineItems(persistedOrder.id, lines, manager);
      persistedOrder.items = items;

      await this.applyPromotionsAndUpdateOrder(
        pricingContext,
        persistedOrder,
        items,
        lines,
        draftTotals,
        manager,
      );

      await this.orderLifecycleService.onOrderCreated(tenant, persistedOrder, items, ctx);

      return persistedOrder;
    });

    const withItems = await this.orderRepository.findByIdWithItems(tenant.tenantId, saved.id);
    return toOrderResponseDto(withItems!, true);
  }

  private async applyPromotionsAndUpdateOrder(
    pricingContext: ReturnType<OrderPricingService['buildPricingContext']>,
    order: OrderEntity,
    items: OrderItemEntity[],
    lines: CalculatedLineItem[],
    draftTotals: DraftOrderTotals,
    manager: EntityManager,
  ): Promise<DraftOrderTotals> {
    const finalTotals = await this.orderPricingService.applyPromotionsAndRecalculate(
      pricingContext,
      draftTotals,
      lines,
      items,
      order,
    );

    const columns = mapDraftTotalsToOrderColumns(finalTotals);
    order.subtotal = columns.subtotal;
    order.tax = columns.tax;
    order.total = columns.total;
    await this.orderRepository.save(order, manager);

    return finalTotals;
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
          price: line.unitPriceWithModifiers,
          notes: line.notes,
        },
        manager,
      );
      items.push(await this.orderItemRepository.save(item, manager));
    }

    return items;
  }
}
