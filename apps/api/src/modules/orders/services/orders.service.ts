import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantContext, AuthenticatedUser } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { CreateOrderDto } from '../dto';
import { UpdateOrderDto } from '../dto';
import { OrderResponseDto } from '../dto';
import { OrderStatusHistoryResponseDto } from '../dto';
import { OrderEventResponseDto } from '../dto';
import { OrderStatus } from '../enums/order-status.enum';
import { isTerminalOrderStatus } from '../domain/order-lifecycle.transitions';
import { toOrderResponseDto } from '../mappers/order.mapper';
import { OrderRepository } from '../repositories/order.repository';
import { OrderCreationService } from './order-creation.service';
import { OrderLifecycleService } from './order-lifecycle.service';
import { OrderEventsService } from './order-events.service';
import { OrderStatusHistoryService } from './order-status-history.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly orderRepository: OrderRepository,
    private readonly orderCreationService: OrderCreationService,
    private readonly orderLifecycleService: OrderLifecycleService,
    private readonly orderEventsService: OrderEventsService,
    private readonly orderStatusHistoryService: OrderStatusHistoryService,
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
    return this.orderCreationService.createOrder(tenant, dto, user);
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
    await this.update(tenant, id, { status: OrderStatus.CANCELLED }, user);
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
