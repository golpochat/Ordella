import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { StockItemEntity, StockTransferEntity } from '../../inventory/entities';
import { StockTransferStatus } from '../../inventory/enums/stock-transfer-status.enum';
import { availableQty, formatQty, parseQty, subtractQty } from '../../inventory/domain/stock-quantity.util';
import { InventoryService } from '../../inventory/services';
import { OrderEntity } from '../../orders/entities';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { LocationEntity, LocationType } from '../../tenants/entities';
import { AssignWarehouseBinItemDto, CompletePickTaskDto, MoveWarehouseBinItemDto, UpdatePickTaskDto, UpsertWarehouseBinDto, UpsertWarehouseZoneDto } from '../dto';
import { WarehouseBinEntity, WarehouseBinItemEntity, WarehousePickTaskEntity, WarehouseZoneEntity } from '../entities';
import { SearchIndexService } from '../../search';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    @InjectRepository(StockItemEntity)
    private readonly stockItems: Repository<StockItemEntity>,
    @InjectRepository(StockTransferEntity)
    private readonly transfers: Repository<StockTransferEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    @InjectRepository(WarehouseZoneEntity)
    private readonly zones: Repository<WarehouseZoneEntity>,
    @InjectRepository(WarehouseBinEntity)
    private readonly bins: Repository<WarehouseBinEntity>,
    @InjectRepository(WarehouseBinItemEntity)
    private readonly binItems: Repository<WarehouseBinItemEntity>,
    @InjectRepository(WarehousePickTaskEntity)
    private readonly pickTasks: Repository<WarehousePickTaskEntity>,
    private readonly searchIndex: SearchIndexService,
    private readonly inventoryService: InventoryService,
  ) {}

  async dashboard(tenant: TenantContext) {
    const warehouseIds = await this.warehouseIds(tenant.tenantId);
    const [stock, inbound, outbound, picks, lowStock, bins] = await Promise.all([
      this.stockItems.find({ where: { tenantId: tenant.tenantId, locationId: In(warehouseIds) } }),
      this.transfers.count({ where: { tenantId: tenant.tenantId, toLocationId: In(warehouseIds), status: StockTransferStatus.IN_TRANSIT } }),
      this.transfers.count({ where: { tenantId: tenant.tenantId, fromLocationId: In(warehouseIds), status: StockTransferStatus.IN_TRANSIT } }),
      this.pickTasks.count({ where: { tenantId: tenant.tenantId, warehouseId: In(warehouseIds), status: In(['pending', 'picking']) } }),
      this.stockItems.find({ where: { tenantId: tenant.tenantId, locationId: In(warehouseIds) }, take: 100 }),
      this.bins.find({ where: { zone: { warehouseId: In(warehouseIds) } }, relations: { zone: true, contents: { item: true } } }),
    ]);
    const low = lowStock.filter((item) => item.reorderLevel !== null && availableQty(item.quantityOnHand, item.quantityReserved) <= parseQty(item.reorderLevel));
    return {
      warehouseCount: warehouseIds.length,
      totalStockItems: stock.length,
      inboundShipments: inbound,
      outboundTransfers: outbound,
      openPickTasks: picks,
      lowStockAlerts: low.length,
      utilization: this.utilization(bins),
      fastMovingItems: stock.slice(0, 10).map((item) => ({
        itemId: item.productId,
        name: item.name,
        available: formatQty(availableQty(item.quantityOnHand, item.quantityReserved)),
      })),
    };
  }

  listZones(tenant: TenantContext) {
    return this.zones.find({
      where: { warehouse: { tenantId: tenant.tenantId } },
      relations: { warehouse: true, bins: true },
      order: { createdAt: 'DESC' },
    });
  }

  async upsertZone(tenant: TenantContext, dto: UpsertWarehouseZoneDto) {
    await this.assertWarehouse(tenant.tenantId, dto.warehouseId);
    const zone = dto.id ? await this.zones.findOne({ where: { id: dto.id, warehouse: { tenantId: tenant.tenantId } } }) : null;
    const entity = zone ?? this.zones.create();
    entity.warehouseId = dto.warehouseId;
    entity.name = dto.name;
    entity.type = dto.type;
    return this.zones.save(entity);
  }

  listBins(tenant: TenantContext) {
    return this.bins.find({
      where: { zone: { warehouse: { tenantId: tenant.tenantId } } },
      relations: { zone: { warehouse: true }, contents: { item: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async upsertBin(tenant: TenantContext, dto: UpsertWarehouseBinDto) {
    const zone = await this.zones.findOne({ where: { id: dto.zoneId, warehouse: { tenantId: tenant.tenantId } } });
    if (!zone) throw new BadRequestException('Zone is invalid');
    const bin = dto.id ? await this.bins.findOne({ where: { id: dto.id, zone: { warehouse: { tenantId: tenant.tenantId } } } }) : null;
    const entity = bin ?? this.bins.create();
    entity.zoneId = dto.zoneId;
    entity.code = dto.code;
    entity.capacity = dto.capacity ?? null;
    const saved = await this.bins.save(entity);
    const indexed = await this.requireBin(tenant.tenantId, saved.id);
    await this.searchIndex.indexBin(indexed);
    return saved;
  }

  async moveItem(tenant: TenantContext, dto: MoveWarehouseBinItemDto) {
    if (dto.fromBinId === dto.toBinId) throw new BadRequestException('Source and destination bins must be different');
    const [fromBin, toBin] = await Promise.all([
      this.requireBin(tenant.tenantId, dto.fromBinId),
      this.requireBin(tenant.tenantId, dto.toBinId),
    ]);
    const source = await this.binItems.findOne({ where: { binId: fromBin.id, itemId: dto.itemId } });
    if (!source || parseQty(source.quantity) < dto.quantity) throw new BadRequestException('Not enough stock in source bin');
    source.quantity = subtractQty(source.quantity, dto.quantity);
    await this.binItems.save(source);
    let destination = await this.binItems.findOne({ where: { binId: toBin.id, itemId: dto.itemId } });
    destination ??= this.binItems.create({ binId: toBin.id, itemId: dto.itemId, quantity: '0.0000' });
    destination.quantity = formatQty(parseQty(destination.quantity) + dto.quantity);
    await this.binItems.save(destination);
    await this.searchIndex.indexBin(await this.requireBin(tenant.tenantId, fromBin.id));
    await this.searchIndex.indexBin(await this.requireBin(tenant.tenantId, toBin.id));
    return this.listBins(tenant);
  }

  async assignItem(tenant: TenantContext, dto: AssignWarehouseBinItemDto) {
    const bin = await this.requireBin(tenant.tenantId, dto.binId);
    let item = await this.binItems.findOne({ where: { binId: bin.id, itemId: dto.itemId } });
    item ??= this.binItems.create({ binId: bin.id, itemId: dto.itemId, quantity: '0.0000' });
    item.quantity = formatQty(dto.quantity);
    await this.binItems.save(item);
    await this.searchIndex.indexBin(await this.requireBin(tenant.tenantId, bin.id));
    return this.listBins(tenant);
  }

  async listPicks(tenant: TenantContext) {
    const tasks = await this.pickTasks.find({
      where: { tenantId: tenant.tenantId },
      relations: { warehouse: true, transfer: { lines: { item: true } }, order: { items: true }, assignee: true, wave: true, slot: true },
      order: { priority: 'DESC', createdAt: 'DESC' },
      take: 100,
    });
    return Promise.all(tasks.map((task) => this.decoratePickTask(task)));
  }

  async createPickForTransfer(tenantId: string, transfer: Pick<StockTransferEntity, 'id' | 'fromLocationId'>) {
    const existing = await this.pickTasks.findOne({ where: { tenantId, transferId: transfer.id } });
    if (existing) return existing;
    return this.pickTasks.save(this.pickTasks.create({
      tenantId,
      warehouseId: transfer.fromLocationId,
      transferId: transfer.id,
      orderId: null,
      status: 'pending',
      assignedTo: null,
      priority: 0,
      batchId: null,
      waveId: null,
      slotId: null,
      startedAt: null,
      completedAt: null,
    }));
  }

  async createPickForOrder(
    tenantId: string,
    order: Pick<OrderEntity, 'id' | 'locationId' | 'orderType' | 'status'>,
    warehouseId = order.locationId,
  ) {
    const existing = await this.pickTasks.findOne({ where: { tenantId, orderId: order.id } });
    if (existing) return existing;
    await this.assertWarehouse(tenantId, warehouseId);
    const task = await this.pickTasks.save(this.pickTasks.create({
      tenantId,
      warehouseId,
      orderId: order.id,
      transferId: null,
      status: 'pending',
      assignedTo: null,
      priority: order.orderType === 'delivery' ? 100 : 50,
      batchId: null,
      waveId: null,
      slotId: null,
      startedAt: null,
      completedAt: null,
    }));
    if ([OrderStatus.ACCEPTED, OrderStatus.PREPARING].includes(order.status)) {
      await this.orders.update({ id: order.id, tenantId }, { status: OrderStatus.PICKING });
    }
    return task;
  }

  async updatePick(tenant: TenantContext, dto: UpdatePickTaskDto) {
    const task = await this.pickTasks.findOne({ where: { id: dto.pickTaskId, tenantId: tenant.tenantId } });
    if (!task) throw new NotFoundException('Pick task not found');
    task.status = dto.status;
    task.assignedTo = dto.assignedTo ?? task.assignedTo;
    if (dto.status === 'picking') task.startedAt ??= new Date();
    if (dto.status === 'picked' || dto.status === 'completed') task.completedAt = new Date();
    return this.pickTasks.save(task);
  }

  async completePick(tenant: TenantContext, dto: CompletePickTaskDto) {
    const task = await this.pickTasks.findOne({
      where: { id: dto.pickTaskId, tenantId: tenant.tenantId },
      relations: { order: { items: true } },
    });
    if (!task) throw new NotFoundException('Pick task not found');
    if (dto.missingItemIds?.length) {
      task.status = 'picking';
      task.startedAt ??= new Date();
      return this.pickTasks.save(task);
    }
    task.status = 'picked';
    task.startedAt ??= new Date();
    task.completedAt = new Date();
    const saved = await this.pickTasks.save(task);
    if (task.order) {
      await this.decrementBinsForOrder(task.warehouseId, task.order, dto.lines);
      await this.tryDeductInventoryForOrder(tenant.tenantId, task.warehouseId, task.order);
      if (![OrderStatus.READY, OrderStatus.HANDED_TO_DRIVER, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REFUNDED].includes(task.order.status)) {
        task.order.status = OrderStatus.PICKED;
        await this.orders.save(task.order);
      }
    }
    return saved;
  }

  private async warehouseIds(tenantId: string) {
    const warehouses = await this.locations.find({
      where: {
        tenantId,
        locationType: In([LocationType.WAREHOUSE, LocationType.DARK_STORE, LocationType.DISTRIBUTION_CENTER]),
      },
      select: { id: true },
    });
    return warehouses.map((warehouse) => warehouse.id);
  }

  private async assertWarehouse(tenantId: string, warehouseId: string) {
    const location = await this.locations.findOne({ where: { id: warehouseId, tenantId } });
    if (!location) throw new BadRequestException('Warehouse location is invalid');
    if (![LocationType.WAREHOUSE, LocationType.DARK_STORE, LocationType.DISTRIBUTION_CENTER].includes(location.locationType)) {
      throw new BadRequestException('Location must be a warehouse, dark store, or distribution center');
    }
  }

  private async requireBin(tenantId: string, binId: string) {
    const bin = await this.bins.findOne({ where: { id: binId, zone: { warehouse: { tenantId } } }, relations: { zone: { warehouse: true } } });
    if (!bin) throw new BadRequestException('Bin is invalid');
    return bin;
  }

  private utilization(bins: WarehouseBinEntity[]) {
    const capacity = bins.reduce((sum, bin) => sum + (bin.capacity ?? 0), 0);
    const used = bins.reduce((sum, bin) => sum + (bin.contents ?? []).reduce((inner, item) => inner + parseQty(item.quantity), 0), 0);
    return capacity > 0 ? Number(((used / capacity) * 100).toFixed(2)) : 0;
  }

  private async decoratePickTask(task: WarehousePickTaskEntity) {
    const lines = task.order?.items ?? [];
    const bins = lines.length
      ? await this.binItems.find({
          where: { itemId: In(lines.map((line) => line.productId)), bin: { zone: { warehouseId: task.warehouseId } } },
          relations: { bin: { zone: true }, item: true },
        })
      : [];
    const binsByItem = new Map(bins.map((bin) => [bin.itemId, bin]));
    return {
      ...task,
      lines: lines.map((line) => {
        const bin = binsByItem.get(line.productId);
        return {
          productId: line.productId,
          productName: bin?.item?.name ?? null,
          quantity: line.quantity,
          binCode: bin?.bin?.code ?? null,
          zoneName: bin?.bin?.zone?.name ?? null,
          status: ['picked', 'completed'].includes(task.status) ? 'picked' : 'pending',
        };
      }),
      pickPath: bins
        .filter((bin) => Boolean(bin.bin?.zone))
        .sort((a, b) => `${a.bin.zone.name}-${a.bin.code}`.localeCompare(`${b.bin.zone.name}-${b.bin.code}`))
        .map((bin) => ({ zoneName: bin.bin.zone.name, binCode: bin.bin.code, itemId: bin.itemId })),
    };
  }

  private async decrementBinsForOrder(
    warehouseId: string,
    order: OrderEntity,
    lines?: CompletePickTaskDto['lines'],
  ) {
    const pickedLines = lines?.length
      ? lines
      : (order.items ?? []).map((item) => ({ productId: item.productId, quantityPicked: item.quantity, substituteProductId: undefined }));
    const requested = new Map(pickedLines.map((line) => [line.substituteProductId ?? line.productId, line.quantityPicked]));
    for (const [productId, quantity] of requested) {
      if (quantity <= 0) continue;
      const binItem = await this.binItems.findOne({
        where: { itemId: productId, bin: { zone: { warehouseId } } },
        relations: { bin: { zone: true } },
        order: { quantity: 'DESC' },
      });
      if (!binItem) continue;
      binItem.quantity = formatQty(Math.max(0, parseQty(binItem.quantity) - quantity));
      await this.binItems.save(binItem);
    }
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
      // Orders created before picking may already be deducted by the order lifecycle.
    }
  }
}
