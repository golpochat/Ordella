import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { OrderEntity } from '../../orders/entities/order.entity';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { CreateDeliveryDto } from '../dto';
import { DeliveryResponseDto } from '../dto';
import { DeliveryTrackingPointResponseDto } from '../dto';
import { UpdateDeliveryDto } from '../dto';
import { DeliveryStatusHistoryResponseDto } from '../dto';
import { DeliveryTaskStatus } from '../enums/delivery-task-status.enum';
import { DeliveryTaskRepository } from '../repositories/delivery-task.repository';
import { DeliveryStatusHistoryRepository } from '../repositories/delivery-status-history.repository';
import { DeliveryService } from './delivery.service';
import { DeliveryBroadcastService } from './delivery-broadcast.service';
import {
  enrichTaskMetadataFromOrder,
  toDeliveryResponseDto,
} from '../mappers/delivery-task.mapper';
import { parseDeliveryFilter } from '../utils/parse-delivery-filter';

@Injectable()
export class DeliveriesCrudService {
  constructor(
    private readonly taskRepository: DeliveryTaskRepository,
    private readonly statusHistoryRepository: DeliveryStatusHistoryRepository,
    private readonly deliveryService: DeliveryService,
    private readonly broadcastService: DeliveryBroadcastService,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async findAll(
    tenant: TenantContext,
    query: FilterPaginationDto,
  ): Promise<DeliveryResponseDto[]> {
    const filter = parseDeliveryFilter(query.filter);
    const tasks = await this.taskRepository.findAllForTenant(tenant.tenantId, {
      driverId: filter.driverId,
      status: filter.status as DeliveryTaskStatus | undefined,
    });
    const filtered = tasks;

    const limit = query.limit ?? 20;
    const page = query.page ?? 1;
    const slice = filtered.slice((page - 1) * limit, page * limit);

    return slice.map((task) => {
      const dto = toDeliveryResponseDto(task);
      return dto;
    });
  }

  async create(_tenant: TenantContext, _dto: CreateDeliveryDto): Promise<DeliveryResponseDto> {
    throw new NotFoundException('Use order checkout to create delivery tasks');
  }

  async findOne(tenant: TenantContext, id: string): Promise<DeliveryResponseDto> {
    const task = await this.taskRepository.findByIdForTenant(tenant.tenantId, id);
    if (!task) {
      throw new NotFoundException('Delivery task not found');
    }

    const order = await this.orderRepository.findOne({
      where: { id: task.orderId, tenantId: tenant.tenantId },
      relations: ['items'],
    });
    const productNames = order ? await this.loadProductNames(tenant.tenantId, order) : new Map();
    const metadata = enrichTaskMetadataFromOrder(task, order, productNames);
    return { ...toDeliveryResponseDto({ ...task, metadata }), metadata };
  }

  async update(
    tenant: TenantContext,
    id: string,
    dto: UpdateDeliveryDto,
  ): Promise<DeliveryResponseDto> {
    const task = await this.taskRepository.findByIdForTenant(tenant.tenantId, id);
    if (!task) {
      throw new NotFoundException('Delivery task not found');
    }

    let updated = task;

    if (dto.driverProfileId && dto.driverProfileId !== task.driverId) {
      updated = await this.deliveryService.assignDriver(
        tenant.tenantId,
        id,
        dto.driverProfileId,
      );
      this.broadcastService.taskAssigned(tenant.tenantId, updated, dto.driverProfileId);
    }

    if (dto.status && dto.status !== updated.status) {
      updated = await this.applyStatusTransition(tenant.tenantId, id, dto.status);
      this.broadcastService.taskUpdated(tenant.tenantId, updated);
    }

    if (dto.notes !== undefined) {
      updated.notes = dto.notes;
      updated = await this.taskRepository.save(updated);
    }

    return toDeliveryResponseDto(updated);
  }

  getTracking(
    _tenant: TenantContext,
    _deliveryTaskId: string,
    _query: FilterPaginationDto,
  ): Promise<DeliveryTrackingPointResponseDto[]> {
    return Promise.resolve([]);
  }

  autoAssign(tenant: TenantContext, deliveryTaskId: string): Promise<DeliveryResponseDto> {
    return this.findOne(tenant, deliveryTaskId);
  }

  async getStatusHistory(
    tenant: TenantContext,
    deliveryTaskId: string,
    _query: FilterPaginationDto,
  ): Promise<DeliveryStatusHistoryResponseDto[]> {
    const task = await this.taskRepository.findByIdForTenant(tenant.tenantId, deliveryTaskId);
    if (!task) {
      throw new NotFoundException('Delivery task not found');
    }

    const rows = await this.statusHistoryRepository.findForTask(deliveryTaskId);
    return rows.map((row) => ({
      id: row.id,
      deliveryTaskId: row.deliveryTaskId,
      fromStatus: row.fromStatus,
      toStatus: row.toStatus,
      changedBy: row.changedBy,
      reason: row.reason,
      metadata: row.metadata ?? {},
      createdAt: row.createdAt,
    }));
  }

  private async applyStatusTransition(
    tenantId: string,
    taskId: string,
    status: DeliveryTaskStatus,
  ) {
    switch (status) {
      case DeliveryTaskStatus.EN_ROUTE:
        return this.deliveryService.markOutForDelivery(tenantId, taskId);
      case DeliveryTaskStatus.DELIVERED:
        return this.deliveryService.markDelivered(tenantId, taskId);
      case DeliveryTaskStatus.FAILED:
        return this.deliveryService.markFailed(tenantId, taskId, 'manual_update');
      default:
        throw new NotFoundException(`Unsupported status transition to ${status}`);
    }
  }

  private async loadProductNames(
    tenantId: string,
    order: OrderEntity,
  ): Promise<Map<string, string>> {
    const productIds = (order.items ?? []).map((i) => i.productId);
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
