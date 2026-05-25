import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { StockItemEntity, StockTransferEntity } from '../../inventory/entities';
import { StockTransferStatus } from '../../inventory/enums/stock-transfer-status.enum';
import { availableQty, formatQty, parseQty, subtractQty } from '../../inventory/domain/stock-quantity.util';
import { LocationEntity, LocationType } from '../../tenants/entities';
import { CompletePickTaskDto, MoveWarehouseBinItemDto, UpdatePickTaskDto, UpsertWarehouseBinDto, UpsertWarehouseZoneDto } from '../dto';
import { WarehouseBinEntity, WarehouseBinItemEntity, WarehousePickTaskEntity, WarehouseZoneEntity } from '../entities';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    @InjectRepository(StockItemEntity)
    private readonly stockItems: Repository<StockItemEntity>,
    @InjectRepository(StockTransferEntity)
    private readonly transfers: Repository<StockTransferEntity>,
    @InjectRepository(WarehouseZoneEntity)
    private readonly zones: Repository<WarehouseZoneEntity>,
    @InjectRepository(WarehouseBinEntity)
    private readonly bins: Repository<WarehouseBinEntity>,
    @InjectRepository(WarehouseBinItemEntity)
    private readonly binItems: Repository<WarehouseBinItemEntity>,
    @InjectRepository(WarehousePickTaskEntity)
    private readonly pickTasks: Repository<WarehousePickTaskEntity>,
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
    return this.bins.save(entity);
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
    return this.listBins(tenant);
  }

  listPicks(tenant: TenantContext) {
    return this.pickTasks.find({
      where: { tenantId: tenant.tenantId },
      relations: { warehouse: true, transfer: { lines: { item: true } }, assignee: true },
      order: { createdAt: 'DESC' },
      take: 100,
    });
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
    }));
  }

  async updatePick(tenant: TenantContext, dto: UpdatePickTaskDto) {
    const task = await this.pickTasks.findOne({ where: { id: dto.pickTaskId, tenantId: tenant.tenantId } });
    if (!task) throw new NotFoundException('Pick task not found');
    task.status = dto.status;
    task.assignedTo = dto.assignedTo ?? task.assignedTo;
    return this.pickTasks.save(task);
  }

  async completePick(tenant: TenantContext, dto: CompletePickTaskDto) {
    return this.updatePick(tenant, { pickTaskId: dto.pickTaskId, status: 'completed' });
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
}
