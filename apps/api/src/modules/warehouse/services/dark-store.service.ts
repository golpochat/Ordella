import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { TenantContext } from '../../../common/interfaces';
import { InventoryService } from '../../inventory/services';
import { StockItemEntity } from '../../inventory/entities';
import { availableQty, parseQty } from '../../inventory/domain/stock-quantity.util';
import { OrderEntity, OrderItemEntity } from '../../orders/entities';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { LocationEntity, LocationType } from '../../tenants/entities';
import {
  CompleteDarkStorePickTaskDto,
  CreateDarkStorePickTaskDto,
  CreatePickWaveDto,
  DarkStoreOrdersQueryDto,
  FulfillmentSlotsQueryDto,
} from '../dto';
import {
  FulfillmentSlotEntity,
  PickWaveEntity,
  WarehouseBinItemEntity,
  WarehousePickTaskEntity,
} from '../entities';

@Injectable()
export class DarkStoreService {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItems: Repository<OrderItemEntity>,
    @InjectRepository(StockItemEntity)
    private readonly stockItems: Repository<StockItemEntity>,
    @InjectRepository(WarehousePickTaskEntity)
    private readonly pickTasks: Repository<WarehousePickTaskEntity>,
    @InjectRepository(PickWaveEntity)
    private readonly pickWaves: Repository<PickWaveEntity>,
    @InjectRepository(FulfillmentSlotEntity)
    private readonly slots: Repository<FulfillmentSlotEntity>,
    @InjectRepository(WarehouseBinItemEntity)
    private readonly binItems: Repository<WarehouseBinItemEntity>,
    private readonly inventoryService: InventoryService,
  ) {}

  async listOrders(tenant: TenantContext, query: DarkStoreOrdersQueryDto) {
    const darkStoreIds = query.locationId
      ? [query.locationId]
      : (await this.darkStoreLocations(tenant.tenantId)).map((location) => location.id);
    if (!darkStoreIds.length) return [];
    const orders = await this.orders.find({
      where: {
        tenantId: tenant.tenantId,
        locationId: In(darkStoreIds),
        status: In([OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY]),
      },
      relations: ['items'],
      order: { createdAt: 'ASC' },
      take: 100,
    });
    if (!orders.length) return [];
    let tasks = await this.pickTasks.find({
      where: { tenantId: tenant.tenantId, orderId: In(orders.map((order) => order.id)) },
    });
    const taskByOrder = new Map(tasks.map((task) => [task.orderId, task]));
    const generated: WarehousePickTaskEntity[] = [];
    for (const order of orders) {
      if (taskByOrder.has(order.id)) continue;
      const task = await this.pickTasks.save(this.pickTasks.create({
        tenantId: tenant.tenantId,
        warehouseId: order.locationId,
        orderId: order.id,
        transferId: null,
        status: 'pending',
        assignedTo: null,
        priority: this.priorityForOrder(order),
        batchId: null,
        waveId: null,
        slotId: null,
        startedAt: null,
        completedAt: null,
      }));
      generated.push(task);
      taskByOrder.set(order.id, task);
    }
    tasks = [...tasks, ...generated];
    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      locationId: order.locationId,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      itemCount: order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
      pickTask: taskByOrder.get(order.id) ?? null,
      fulfilledBy: 'dark_store',
    }));
  }

  async createPickTask(tenant: TenantContext, dto: CreateDarkStorePickTaskDto) {
    const order = await this.requireOrder(tenant.tenantId, dto.orderId);
    const locationId = dto.locationId ?? (await this.routeOrderToDarkStore(tenant.tenantId, order)) ?? order.locationId;
    await this.assertDarkStoreLocation(tenant.tenantId, locationId);
    const existing = await this.pickTasks.findOne({ where: { tenantId: tenant.tenantId, orderId: order.id } });
    if (existing) return this.decorateTask(existing);
    const task = await this.pickTasks.save(this.pickTasks.create({
      tenantId: tenant.tenantId,
      warehouseId: locationId,
      orderId: order.id,
      transferId: null,
      status: 'pending',
      assignedTo: dto.pickerId ?? null,
      priority: dto.priority ?? this.priorityForOrder(order),
      batchId: null,
      waveId: null,
      slotId: null,
      startedAt: null,
      completedAt: null,
    }));
    if (order.locationId !== locationId) {
      order.locationId = locationId;
      await this.orders.save(order);
    }
    return this.decorateTask(task);
  }

  async completePickTask(tenant: TenantContext, dto: CompleteDarkStorePickTaskDto) {
    const task = await this.pickTasks.findOne({
      where: { id: dto.pickTaskId, tenantId: tenant.tenantId },
      relations: ['order', 'order.items'],
    });
    if (!task) throw new NotFoundException('Pick task not found');
    if (dto.missingItemIds?.length) {
      task.status = 'picking';
      task.startedAt ??= new Date();
      return this.decorateTask(await this.pickTasks.save(task), dto.missingItemIds);
    }
    task.status = 'completed';
    task.startedAt ??= new Date();
    task.completedAt = new Date();
    const saved = await this.pickTasks.save(task);
    if (task.order) {
      await this.tryDeductInventoryForOrder(tenant.tenantId, task.warehouseId, task.order);
      if (![OrderStatus.OUT_FOR_DELIVERY, OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REFUNDED].includes(task.order.status)) {
        task.order.status = OrderStatus.READY;
        await this.orders.save(task.order);
      }
    }
    await this.completeWaveIfDone(tenant.tenantId, saved.waveId);
    return this.decorateTask(saved);
  }

  async createWave(tenant: TenantContext, dto: CreatePickWaveDto) {
    await this.assertDarkStoreLocation(tenant.tenantId, dto.locationId);
    const wave = await this.pickWaves.save(this.pickWaves.create({
      tenantId: tenant.tenantId,
      locationId: dto.locationId,
      status: 'picking',
      pickerId: dto.pickerId ?? null,
    }));
    const batchId = randomUUID();
    const tasks = dto.pickTaskIds?.length
      ? await this.pickTasks.find({ where: { tenantId: tenant.tenantId, id: In(dto.pickTaskIds), warehouseId: dto.locationId } })
      : await this.pickTasks.find({
          where: { tenantId: tenant.tenantId, warehouseId: dto.locationId, status: 'pending' },
          order: { priority: 'DESC', createdAt: 'ASC' },
          take: 20,
        });
    for (const task of tasks) {
      task.waveId = wave.id;
      task.batchId = batchId;
      task.status = 'picking';
      task.assignedTo = dto.pickerId ?? task.assignedTo;
      task.startedAt ??= new Date();
    }
    await this.pickTasks.save(tasks);
    return {
      ...wave,
      batchId,
      taskCount: tasks.length,
      tasks: await Promise.all(tasks.map((task) => this.decorateTask(task))),
    };
  }

  async listSlots(tenant: TenantContext, query: FulfillmentSlotsQueryDto) {
    const darkStores = query.locationId
      ? [await this.assertDarkStoreLocation(tenant.tenantId, query.locationId)]
      : await this.darkStoreLocations(tenant.tenantId);
    if (!darkStores.length) return [];
    const from = query.from ? new Date(query.from) : new Date();
    const to = query.to ? new Date(query.to) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const existing = await this.slots.find({
      where: { tenantId: tenant.tenantId, locationId: In(darkStores.map((location) => location.id)) },
      order: { startTime: 'ASC' },
    });
    const filtered = existing.filter((slot) => slot.startTime >= from && slot.startTime <= to);
    if (filtered.length) return filtered;
    return darkStores.flatMap((location) => this.defaultSlots(tenant.tenantId, location.id, from));
  }

  private async routeOrderToDarkStore(tenantId: string, order: OrderEntity): Promise<string | null> {
    const darkStores = await this.darkStoreLocations(tenantId);
    for (const location of darkStores) {
      const hasStock = await this.locationCanFulfill(tenantId, location.id, order.items ?? []);
      if (hasStock) return location.id;
    }
    return darkStores[0]?.id ?? null;
  }

  private async locationCanFulfill(tenantId: string, locationId: string, items: OrderItemEntity[]) {
    if (!items.length) return true;
    const stock = await this.stockItems.find({
      where: { tenantId, locationId, productId: In(items.map((item) => item.productId)) },
    });
    const byProduct = new Map(stock.map((item) => [item.productId, item]));
    return items.every((item) => {
      const stockItem = byProduct.get(item.productId);
      return stockItem ? availableQty(stockItem.quantityOnHand, stockItem.quantityReserved) >= item.quantity : false;
    });
  }

  private async decorateTask(task: WarehousePickTaskEntity, missingItemIds: string[] = []) {
    const full = await this.pickTasks.findOne({
      where: { id: task.id },
      relations: { warehouse: true, order: { items: true }, wave: true, assignee: true },
    });
    const active = full ?? task;
    const lines = active.order?.items ?? [];
    const bins = lines.length
      ? await this.binItems.find({
          where: { itemId: In(lines.map((line) => line.productId)) },
          relations: { bin: { zone: true }, item: true },
        })
      : [];
    const binsByItem = new Map(bins.map((bin) => [bin.itemId, bin]));
    return {
      ...active,
      lines: lines.map((line) => {
        const bin = binsByItem.get(line.productId);
        return {
          productId: line.productId,
          quantity: line.quantity,
          binCode: bin?.bin?.code ?? null,
          zoneName: bin?.bin?.zone?.name ?? null,
          status: missingItemIds.includes(line.productId) ? 'missing' : active.status === 'completed' ? 'picked' : 'pending',
        };
      }),
      pickPath: bins
        .filter((bin) => Boolean(bin.bin?.zone))
        .sort((a, b) => `${a.bin.zone.name}-${a.bin.code}`.localeCompare(`${b.bin.zone.name}-${b.bin.code}`))
        .map((bin) => ({ zoneName: bin.bin.zone.name, binCode: bin.bin.code, itemId: bin.itemId })),
    };
  }

  private async requireOrder(tenantId: string, orderId: string) {
    const order = await this.orders.findOne({ where: { id: orderId, tenantId }, relations: ['items'] });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  private async darkStoreLocations(tenantId: string) {
    return this.locations.find({
      where: [
        { tenantId, fulfillmentMode: In(['dark_store', 'micro_fulfillment']) },
        { tenantId, locationType: In([LocationType.DARK_STORE, LocationType.WAREHOUSE, LocationType.DISTRIBUTION_CENTER]) },
      ],
      order: { name: 'ASC' },
    });
  }

  private async assertDarkStoreLocation(tenantId: string, locationId: string) {
    const location = await this.locations.findOne({ where: { id: locationId, tenantId } });
    if (!location) throw new BadRequestException('Dark store location is invalid');
    const darkModes = ['dark_store', 'micro_fulfillment'];
    const darkTypes = [LocationType.DARK_STORE, LocationType.WAREHOUSE, LocationType.DISTRIBUTION_CENTER];
    if (!darkModes.includes(location.fulfillmentMode) && !darkTypes.includes(location.locationType)) {
      throw new BadRequestException('Location must be enabled for dark-store or micro-fulfillment work');
    }
    return location;
  }

  private async tryDeductInventoryForOrder(tenantId: string, locationId: string, order: OrderEntity) {
    try {
      await this.inventoryService.deduct({
        tenantId,
        orderId: order.id,
        locationId,
        lines: (order.items ?? []).map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });
    } catch {
      // Existing order flows may already deduct or may not reserve stock yet. The task still completes for MVP operations.
    }
  }

  private async completeWaveIfDone(tenantId: string, waveId: string | null) {
    if (!waveId) return;
    const open = await this.pickTasks.count({ where: { tenantId, waveId, status: In(['pending', 'picking']) } });
    if (open > 0) return;
    const wave = await this.pickWaves.findOne({ where: { id: waveId, tenantId } });
    if (!wave) return;
    wave.status = 'completed';
    await this.pickWaves.save(wave);
  }

  private priorityForOrder(order: OrderEntity) {
    if (order.orderType === 'delivery') return 100;
    return 50;
  }

  private defaultSlots(tenantId: string, locationId: string, start: Date) {
    return Array.from({ length: 6 }, (_, idx) => {
      const slotStart = new Date(start.getTime() + idx * 30 * 60 * 1000);
      const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
      return {
        id: `preview-${locationId}-${idx}`,
        tenantId,
        locationId,
        startTime: slotStart,
        endTime: slotEnd,
        capacity: 10,
        createdAt: start,
      };
    });
  }
}
