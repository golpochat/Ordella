import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { AuthenticatedUser } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { CreateOrderDto } from '../dto';
import { UpdateOrderDto } from '../dto';
import { OrderResponseDto } from '../dto';
import { OrderStatusHistoryResponseDto } from '../dto';
import { OrderEventResponseDto } from '../dto';
import { OrderStatus } from '../enums/order-status.enum';
import { DEFAULT_ORDER_TAX_RATE } from '../constants/order-tax.constants';
import { calculateOrderTotals } from '../domain/order-totals.util';
import { generateOrderNumber } from '../domain/order-number.util';
import { isTerminalOrderStatus } from '../domain/order-lifecycle.transitions';
import { OrderItemEntity } from '../entities/order-item.entity';
import { toOrderResponseDto } from '../mappers/order.mapper';
import { OrderRepository } from '../repositories/order.repository';
import { OrderItemRepository } from '../repositories/order-item.repository';
import { OrderLifecycleService } from './order-lifecycle.service';
import { OrderPricingService } from './order-pricing.service';
import { OrderEventsService } from './order-events.service';
import { OrderStatusHistoryService } from './order-status-history.service';
import { OrderPromotionHook } from '../hooks';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderRepository: OrderRepository,
    private readonly orderItemRepository: OrderItemRepository,
    private readonly orderPricingService: OrderPricingService,
    private readonly orderLifecycleService: OrderLifecycleService,
    private readonly orderEventsService: OrderEventsService,
    private readonly orderStatusHistoryService: OrderStatusHistoryService,
    private readonly promotionHook: OrderPromotionHook,
  ) {}

  async findAll(
    tenant: TenantContext,
    query: FilterPaginationDto,
  ): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findAllForTenant(tenant.tenantId, query);
    return orders.map((order) => toOrderResponseDto(order));
  }

  async create(
    tenant: TenantContext,
    dto: CreateOrderDto,
    user?: AuthenticatedUser,
  ): Promise<OrderResponseDto> {
    const resolvedLines = await Promise.all(
      dto.items.map(async (line) => {
        const priced = await this.orderPricingService.resolveLinePrice(
          tenant,
          line.productId,
          line.variantId,
        );
        return {
          productId: line.productId,
          variantId: line.variantId ?? null,
          quantity: line.quantity,
          price: priced.unitPrice,
          notes: line.notes ?? null,
        };
      }),
    );

    const totals = calculateOrderTotals(resolvedLines, DEFAULT_ORDER_TAX_RATE);

    const saved = await this.dataSource.transaction(async (manager) => {
      const order = this.orderRepository.create(
        {
          tenantId: tenant.tenantId,
          locationId: dto.locationId,
          customerId: dto.customerId ?? null,
          orderType: dto.orderType,
          status: OrderStatus.PENDING,
          subtotal: totals.subtotal,
          tax: totals.tax,
          total: totals.total,
          orderNumber: generateOrderNumber(),
        },
        manager,
      );
      const persistedOrder = await this.orderRepository.save(order, manager);

      const items: OrderItemEntity[] = [];
      for (const line of resolvedLines) {
        const item = this.orderItemRepository.create(
          {
            orderId: persistedOrder.id,
            productId: line.productId,
            variantId: line.variantId,
            quantity: line.quantity,
            price: line.price,
            notes: line.notes,
          },
          manager,
        );
        items.push(await this.orderItemRepository.save(item, manager));
      }

      persistedOrder.items = items;

      const promotion = await this.promotionHook.applyOnOrderCreated(
        tenant,
        persistedOrder,
        items,
      );
      if (Number(promotion.discountAmount) > 0) {
        const discountedTotal = Math.max(
          0,
          Number(persistedOrder.total) - Number(promotion.discountAmount),
        );
        persistedOrder.total = discountedTotal.toFixed(2);
        await this.orderRepository.save(persistedOrder, manager);
      }

      await this.orderLifecycleService.onOrderCreated(
        tenant,
        persistedOrder,
        items,
        { changedBy: user?.id ?? null, manager },
      );

      return persistedOrder;
    });

    const withItems = await this.orderRepository.findByIdWithItems(
      tenant.tenantId,
      saved.id,
    );
    return toOrderResponseDto(withItems!, true);
  }

  async findOne(tenant: TenantContext, id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findByIdWithItems(tenant.tenantId, id);
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    return toOrderResponseDto(order, true);
  }

  async update(
    tenant: TenantContext,
    id: string,
    dto: UpdateOrderDto,
    user?: AuthenticatedUser,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findByIdWithItems(tenant.tenantId, id);
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    if (isTerminalOrderStatus(order.status)) {
      throw new BadRequestException(`Cannot update order in status "${order.status}"`);
    }

    if (dto.status !== undefined && dto.status !== order.status) {
      order.status = dto.status;
      const updated = await this.dataSource.transaction(async (manager) => {
        const managedOrder = await this.orderRepository.findByIdWithItems(
          tenant.tenantId,
          id,
          manager,
        );
        if (!managedOrder) {
          throw new NotFoundException(`Order ${id} not found`);
        }
        const items = managedOrder.items ?? [];
        await this.orderLifecycleService.transition(
          tenant,
          managedOrder,
          items,
          dto.status!,
          { changedBy: user?.id ?? null, manager },
        );
        return this.orderRepository.save(managedOrder, manager);
      });
      const refreshed = await this.orderRepository.findByIdWithItems(
        tenant.tenantId,
        updated.id,
      );
      return toOrderResponseDto(refreshed!, true);
    }

    if (dto.customerId !== undefined) {
      order.customerId = dto.customerId;
    }
    if (dto.orderType !== undefined) {
      order.orderType = dto.orderType;
    }

    const saved = await this.orderRepository.save(order);
    const refreshed = await this.orderRepository.findByIdWithItems(
      tenant.tenantId,
      saved.id,
    );
    return toOrderResponseDto(refreshed!, true);
  }

  async cancel(
    tenant: TenantContext,
    id: string,
    user?: AuthenticatedUser,
  ): Promise<void> {
    await this.update(
      tenant,
      id,
      { status: OrderStatus.CANCELLED },
      user,
    );
  }

  async getStatusHistory(
    tenant: TenantContext,
    orderId: string,
    query: FilterPaginationDto,
  ): Promise<OrderStatusHistoryResponseDto[]> {
    await this.assertOrderExists(tenant.tenantId, orderId);
    return this.orderStatusHistoryService.findByOrderId(tenant, orderId, query);
  }

  async getEvents(
    tenant: TenantContext,
    orderId: string,
    query: FilterPaginationDto,
  ): Promise<OrderEventResponseDto[]> {
    await this.assertOrderExists(tenant.tenantId, orderId);
    return this.orderEventsService.findByOrderId(tenant, orderId, query);
  }

  private async assertOrderExists(tenantId: string, orderId: string): Promise<void> {
    const order = await this.orderRepository.findByIdForTenant(tenantId, orderId);
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
  }
}
