import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { OrderEntity } from '../../orders/entities/order.entity';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { OrderType } from '../../orders/enums/order-type.enum';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { OrdersService } from '../../orders/services/orders.service';
import { DeliveryTaskStatus } from '../enums/delivery-task-status.enum';
import { DeliveryTaskRepository } from '../repositories/delivery-task.repository';
import { DriverProfileRepository } from '../repositories/driver-profile.repository';
import { DeliveryService } from './delivery.service';
import { DeliveryBroadcastService } from './delivery-broadcast.service';
import { DriverOrderResponseDto } from '../dto/driver-orders/driver-order-response.dto';
import { toDriverOrderResponseDto } from '../mappers/delivery-task.mapper';
import {
  throwDeliveryTaskForOrderNotFound,
  throwInactiveDriver,
} from '../domain/delivery-domain.errors';

@Injectable()
export class DriverOrdersService {
  constructor(
    private readonly taskRepository: DeliveryTaskRepository,
    private readonly driverRepository: DriverProfileRepository,
    private readonly deliveryService: DeliveryService,
    private readonly broadcastService: DeliveryBroadcastService,
    private readonly ordersService: OrdersService,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async getAssigned(tenantId: string, driverId: string): Promise<DriverOrderResponseDto[]> {
    await this.requireActiveDriver(tenantId, driverId);
    const tasks = await this.taskRepository.findAssignedForDriver(tenantId, driverId);
    return this.mapTasksWithOrders(tenantId, tasks);
  }

  async getAvailable(tenantId: string, driverId: string): Promise<DriverOrderResponseDto[]> {
    await this.requireActiveDriver(tenantId, driverId);
    const tasks = await this.taskRepository.findAvailableForTenant(tenantId);
    return this.mapTasksWithOrders(tenantId, tasks);
  }

  async getCompleted(tenantId: string, driverId: string): Promise<DriverOrderResponseDto[]> {
    await this.requireActiveDriver(tenantId, driverId);
    const tasks = await this.taskRepository.findCompletedForDriver(tenantId, driverId);
    return this.mapTasksWithOrders(tenantId, tasks);
  }

  async accept(
    tenant: TenantContext,
    orderId: string,
    driverId: string,
  ): Promise<DriverOrderResponseDto> {
    await this.requireActiveDriver(tenant.tenantId, driverId);
    const task = await this.taskRepository.findByOrderForTenant(tenant.tenantId, orderId);
    if (!task) {
      throwDeliveryTaskForOrderNotFound(orderId);
    }

    if (task.driverId && task.driverId !== driverId) {
      throw new BadRequestException('Order is assigned to another driver');
    }

    let updated = task;
    if (task.status === DeliveryTaskStatus.PENDING) {
      updated = await this.deliveryService.assignDriver(tenant.tenantId, task.id, driverId);
      this.broadcastService.taskAssigned(tenant.tenantId, updated, driverId);
    } else if (task.driverId === driverId) {
      this.broadcastService.taskUpdated(tenant.tenantId, updated);
    }

    return this.mapSingle(tenant.tenantId, updated);
  }

  async startDelivery(
    tenant: TenantContext,
    orderId: string,
    driverId: string,
  ): Promise<DriverOrderResponseDto> {
    const task = await this.requireDriverTask(tenant.tenantId, orderId, driverId);
    if (task.status !== DeliveryTaskStatus.ASSIGNED) {
      throw new BadRequestException('Order must be accepted before starting delivery');
    }

    const updated = await this.deliveryService.markOutForDelivery(tenant.tenantId, task.id);
    await this.syncOrderStatus(tenant, orderId, OrderStatus.OUT_FOR_DELIVERY);
    this.broadcastService.taskUpdated(tenant.tenantId, updated);
    return this.mapSingle(tenant.tenantId, updated);
  }

  async completeDelivery(
    tenant: TenantContext,
    orderId: string,
    driverId: string,
  ): Promise<DriverOrderResponseDto> {
    const task = await this.requireDriverTask(tenant.tenantId, orderId, driverId);
    if (task.status !== DeliveryTaskStatus.EN_ROUTE) {
      throw new BadRequestException('Order must be en route before completing');
    }

    const updated = await this.deliveryService.markDelivered(tenant.tenantId, task.id);
    await this.syncOrderStatus(tenant, orderId, OrderStatus.COMPLETED);
    this.broadcastService.taskUpdated(tenant.tenantId, updated);
    return this.mapSingle(tenant.tenantId, updated);
  }

  async pickupComplete(
    tenant: TenantContext,
    orderId: string,
    driverId: string,
  ): Promise<DriverOrderResponseDto> {
    const task = await this.requireDriverTask(tenant.tenantId, orderId, driverId);
    const order = await this.orderRepository.findOne({
      where: { id: orderId, tenantId: tenant.tenantId },
    });
    if (order?.orderType !== OrderType.PICKUP) {
      throw new BadRequestException('This action applies to pickup orders only');
    }

    let updated = task;
    if (task.status === DeliveryTaskStatus.ASSIGNED) {
      updated = await this.deliveryService.markOutForDelivery(tenant.tenantId, task.id);
      this.broadcastService.taskUpdated(tenant.tenantId, updated);
      return this.mapSingle(tenant.tenantId, updated);
    }

    if (task.status === DeliveryTaskStatus.EN_ROUTE) {
      updated = await this.deliveryService.markDelivered(tenant.tenantId, task.id);
      await this.syncOrderStatus(tenant, orderId, OrderStatus.COMPLETED);
      this.broadcastService.taskUpdated(tenant.tenantId, updated);
      return this.mapSingle(tenant.tenantId, updated);
    }

    throw new BadRequestException('Invalid pickup order status for this action');
  }

  async updateLocation(
    tenantId: string,
    driverId: string,
    lat?: number,
    lng?: number,
  ): Promise<{ ok: true }> {
    await this.requireActiveDriver(tenantId, driverId);
    if (lat === undefined || lng === undefined) {
      throw new BadRequestException('lat and lng are required');
    }
    const driver = await this.driverRepository.findByIdForTenant(tenantId, driverId);
    if (driver) {
      driver.lastLat = lat.toFixed(7);
      driver.lastLng = lng.toFixed(7);
      driver.lastSeenAt = new Date();
      await this.driverRepository.save(driver);
    }
    return { ok: true };
  }

  private async requireDriverTask(tenantId: string, orderId: string, driverId: string) {
    const task = await this.taskRepository.findByOrderForTenant(tenantId, orderId);
    if (!task) {
      throw new NotFoundException('Delivery task not found for order');
    }
    if (task.driverId !== driverId) {
      throw new BadRequestException('Order is not assigned to you');
    }
    return task;
  }

  private async requireActiveDriver(tenantId: string, driverId: string) {
    const driver = await this.driverRepository.findByIdForTenant(tenantId, driverId);
    if (!driver || !driver.active) {
      throwInactiveDriver(driverId);
    }
    return driver;
  }

  private async syncOrderStatus(
    tenant: TenantContext,
    orderId: string,
    status: OrderStatus,
  ): Promise<void> {
    try {
      await this.ordersService.update(tenant, orderId, { status });
    } catch {
      // Order may already be in target status from fulfillment flow
    }
  }

  private async mapTasksWithOrders(
    tenantId: string,
    tasks: Awaited<ReturnType<DeliveryTaskRepository['findAssignedForDriver']>>,
  ): Promise<DriverOrderResponseDto[]> {
    if (!tasks.length) {
      return [];
    }

    const orderIds = tasks.map((t) => t.orderId);
    const orders = await this.orderRepository.find({
      where: { tenantId, id: In(orderIds) },
      relations: ['items'],
    });
    const orderMap = new Map(orders.map((o) => [o.id, o]));
    const productNames = await this.loadProductNames(tenantId, orders);

    return tasks.map((task) =>
      toDriverOrderResponseDto(task, orderMap.get(task.orderId) ?? null, productNames),
    );
  }

  private async mapSingle(
    tenantId: string,
    task: Awaited<ReturnType<DeliveryTaskRepository['findByOrderForTenant']>> & object,
  ): Promise<DriverOrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id: task.orderId, tenantId },
      relations: ['items'],
    });
    const productNames = order
      ? await this.loadProductNames(tenantId, [order])
      : new Map<string, string>();
    return toDriverOrderResponseDto(task, order, productNames);
  }

  private async loadProductNames(
    tenantId: string,
    orders: OrderEntity[],
  ): Promise<Map<string, string>> {
    const productIds = [
      ...new Set(orders.flatMap((o) => (o.items ?? []).map((i) => i.productId))),
    ];
    if (!productIds.length) {
      return new Map();
    }
    const products = await this.productRepository.find({
      where: { tenantId, id: In(productIds) },
      select: ['id', 'name'],
    });
    return new Map(products.map((p) => [p.id, p.name]));
  }
}
