import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { LocationEntity } from '../../tenants/entities';
import { NotificationChannelType } from '../../notifications/enums/notification-channel-type.enum';
import { NotificationType } from '../../notifications/enums/notification-type.enum';
import { NotificationsService } from '../../notifications/services';
import { CreateStockTransferDto, ReceiveStockTransferDto, UpdateStockTransferDto, StockTransferResponseDto } from '../dto';
import { addQty, availableQty, formatQty, parseQty, subtractQty } from '../domain/stock-quantity.util';
import { StockItemEntity, StockMovementEntity, StockTransferEntity, StockTransferLineEntity } from '../entities';
import { StockMovementSource } from '../enums/stock-movement-source.enum';
import { StockMovementType } from '../enums/stock-movement-type.enum';
import { StockReferenceType } from '../enums/stock-reference-type.enum';
import { StockTransferStatus } from '../enums/stock-transfer-status.enum';

@Injectable()
export class StockTransfersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(StockTransferEntity)
    private readonly transfers: Repository<StockTransferEntity>,
    @InjectRepository(StockTransferLineEntity)
    private readonly transferLines: Repository<StockTransferLineEntity>,
    @InjectRepository(StockItemEntity)
    private readonly stockItems: Repository<StockItemEntity>,
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    private readonly notifications: NotificationsService,
  ) {}

  async findAll(tenant: TenantContext, query: FilterPaginationDto): Promise<StockTransferResponseDto[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const rows = await this.transfers.find({
      where: { tenantId: tenant.tenantId },
      relations: { fromLocation: true, toLocation: true, lines: { item: true } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return rows.map((row) => this.toResponse(row));
  }

  async create(tenant: TenantContext, dto: CreateStockTransferDto): Promise<StockTransferResponseDto> {
    if (dto.fromLocationId === dto.toLocationId) {
      throw new BadRequestException('Source and destination locations must be different');
    }
    let notification: 'created' | 'shipped' = 'created';
    const transfer = await this.dataSource.transaction(async (manager) => {
      await this.assertLocations(tenant.tenantId, [dto.fromLocationId, dto.toLocationId]);
      const status = dto.status === StockTransferStatus.IN_TRANSIT ? StockTransferStatus.IN_TRANSIT : StockTransferStatus.DRAFT;
      const entity = await manager.getRepository(StockTransferEntity).save(manager.getRepository(StockTransferEntity).create({
        tenantId: tenant.tenantId,
        fromLocationId: dto.fromLocationId,
        toLocationId: dto.toLocationId,
        status,
        notes: dto.notes ?? null,
        dispatchedAt: status === StockTransferStatus.IN_TRANSIT ? new Date() : null,
      }));

      for (const line of dto.lines) {
        const source = await this.requireSourceStockItem(tenant.tenantId, dto.fromLocationId, line.stockItemId, manager, status === StockTransferStatus.IN_TRANSIT);
        if (!source.productId) throw new BadRequestException('Transfer lines require stock items linked to catalog items');
        if (status === StockTransferStatus.IN_TRANSIT) {
          this.assertAvailable(source, line.quantity);
          source.quantityOnHand = subtractQty(source.quantityOnHand, line.quantity);
          await manager.getRepository(StockItemEntity).save(source);
          await this.appendMovement(manager, tenant.tenantId, source.id, StockMovementType.OUT, line.quantity, entity.id, 'Transfer shipped');
          notification = 'shipped';
        }
        await manager.getRepository(StockTransferLineEntity).save(manager.getRepository(StockTransferLineEntity).create({
          transferId: entity.id,
          stockItemId: source.id,
          itemId: source.productId,
          quantity: formatQty(line.quantity),
          quantityRequested: formatQty(line.quantity),
          quantitySent: status === StockTransferStatus.IN_TRANSIT ? formatQty(line.quantity) : '0.0000',
          quantityReceived: '0.0000',
        }));
      }
      return entity;
    });
    const saved = await this.requireTransfer(tenant.tenantId, transfer.id);
    await this.notify(tenant.tenantId, saved, notification);
    return this.toResponse(saved);
  }

  async findOne(tenant: TenantContext, id: string): Promise<StockTransferResponseDto> {
    return this.toResponse(await this.requireTransfer(tenant.tenantId, id));
  }

  async update(
    tenant: TenantContext,
    id: string,
    dto: UpdateStockTransferDto,
  ): Promise<StockTransferResponseDto> {
    if (dto.status === StockTransferStatus.IN_TRANSIT) {
      return this.dispatch(tenant, id, dto.notes);
    }
    if (dto.status === StockTransferStatus.RECEIVED || dto.status === StockTransferStatus.COMPLETED) {
      return this.receive(tenant, id, { lines: dto.lines ?? [] });
    }
    if (dto.status === StockTransferStatus.CANCELLED) {
      const transfer = await this.requireTransfer(tenant.tenantId, id);
      if ([StockTransferStatus.RECEIVED, StockTransferStatus.COMPLETED].includes(transfer.status)) {
        throw new BadRequestException('Received transfers cannot be cancelled');
      }
      transfer.status = StockTransferStatus.CANCELLED;
      transfer.notes = dto.notes ?? transfer.notes;
      transfer.cancelledAt = new Date();
      return this.toResponse(await this.transfers.save(transfer));
    }
    const transfer = await this.requireTransfer(tenant.tenantId, id);
    transfer.notes = dto.notes ?? transfer.notes;
    return this.toResponse(await this.transfers.save(transfer));
  }

  async dispatch(tenant: TenantContext, id: string, notes?: string): Promise<StockTransferResponseDto> {
    const transfer = await this.dataSource.transaction(async (manager) => {
      const entity = await this.requireTransfer(tenant.tenantId, id);
      if (entity.status !== StockTransferStatus.DRAFT && entity.status !== StockTransferStatus.PENDING) {
        throw new BadRequestException('Only draft transfers can be marked in transit');
      }
      for (const line of entity.lines) {
        const quantity = parseQty(line.quantityRequested || line.quantity);
        const source = await this.requireSourceStockItem(tenant.tenantId, entity.fromLocationId, line.stockItemId, manager, true);
        this.assertAvailable(source, quantity);
        source.quantityOnHand = subtractQty(source.quantityOnHand, quantity);
        await manager.getRepository(StockItemEntity).save(source);
        line.quantitySent = formatQty(quantity);
        await manager.getRepository(StockTransferLineEntity).save(line);
        await this.appendMovement(manager, tenant.tenantId, source.id, StockMovementType.OUT, quantity, entity.id, 'Transfer shipped');
      }
      entity.status = StockTransferStatus.IN_TRANSIT;
      entity.notes = notes ?? entity.notes;
      entity.dispatchedAt = new Date();
      return manager.getRepository(StockTransferEntity).save(entity);
    });
    const saved = await this.requireTransfer(tenant.tenantId, transfer.id);
    await this.notify(tenant.tenantId, saved, 'shipped');
    return this.toResponse(saved);
  }

  async receive(tenant: TenantContext, id: string, dto: ReceiveStockTransferDto): Promise<StockTransferResponseDto> {
    const transfer = await this.dataSource.transaction(async (manager) => {
      const entity = await this.requireTransfer(tenant.tenantId, id);
      if (entity.status !== StockTransferStatus.IN_TRANSIT) {
        throw new BadRequestException('Only in-transit transfers can be received');
      }
      const receivedByLine = new Map(dto.lines.map((line) => [line.transferLineId, line.quantityReceived]));
      let receivedAny = false;
      for (const line of entity.lines) {
        const quantity = receivedByLine.get(line.id) ?? parseQty(line.quantitySent);
        if (quantity <= 0) continue;
        const remaining = parseQty(line.quantitySent) - parseQty(line.quantityReceived);
        const accepted = Math.min(quantity, remaining);
        if (accepted <= 0) continue;
        if (!line.itemId) throw new BadRequestException('Transfer line is missing catalog item reference');
        const destination = await this.findOrCreateDestinationStockItem(tenant.tenantId, entity.toLocationId, line, manager);
        destination.quantityOnHand = addQty(destination.quantityOnHand, accepted);
        await manager.getRepository(StockItemEntity).save(destination);
        line.quantityReceived = addQty(line.quantityReceived, accepted);
        await manager.getRepository(StockTransferLineEntity).save(line);
        await this.appendMovement(manager, tenant.tenantId, destination.id, StockMovementType.IN, accepted, entity.id, 'Transfer received');
        receivedAny = true;
      }
      if (!receivedAny) throw new BadRequestException('No receivable transfer quantities were provided');
      const complete = entity.lines.every((line) => parseQty(line.quantityReceived) >= parseQty(line.quantitySent));
      entity.status = complete ? StockTransferStatus.RECEIVED : StockTransferStatus.IN_TRANSIT;
      entity.receivedAt = complete ? new Date() : entity.receivedAt;
      return manager.getRepository(StockTransferEntity).save(entity);
    });
    const saved = await this.requireTransfer(tenant.tenantId, transfer.id);
    await this.notify(tenant.tenantId, saved, 'received');
    return this.toResponse(saved);
  }

  private async assertLocations(tenantId: string, locationIds: string[]) {
    const count = await this.locations.count({ where: { tenantId, id: In(locationIds) } });
    if (count !== locationIds.length) throw new BadRequestException('One or more locations are invalid');
  }

  private async requireTransfer(tenantId: string, id: string) {
    const transfer = await this.transfers.findOne({
      where: { tenantId, id },
      relations: { fromLocation: true, toLocation: true, lines: { item: true, stockItem: true } },
    });
    if (!transfer) throw new NotFoundException('Stock transfer not found');
    return transfer;
  }

  private async requireSourceStockItem(tenantId: string, locationId: string, stockItemId: string, manager: EntityManager = this.dataSource.manager, lock = false) {
    const qb = manager.getRepository(StockItemEntity)
      .createQueryBuilder('item')
      .where('item.id = :stockItemId', { stockItemId })
      .andWhere('item.tenantId = :tenantId', { tenantId })
      .andWhere('item.locationId = :locationId', { locationId });
    if (lock) qb.setLock('pessimistic_write');
    const item = await qb.getOne();
    if (!item) throw new BadRequestException('Stock item does not belong to the source location');
    return item;
  }

  private assertAvailable(item: StockItemEntity, quantity: number) {
    const available = availableQty(item.quantityOnHand, item.quantityReserved);
    if (quantity > available) throw new BadRequestException(`Insufficient warehouse stock for ${item.name}`);
  }

  private async findOrCreateDestinationStockItem(tenantId: string, locationId: string, line: StockTransferLineEntity, manager: EntityManager = this.dataSource.manager) {
    const productId = line.itemId ?? line.stockItem.productId;
    if (!productId) throw new BadRequestException('Transfer line is missing product reference');
    const existing = await manager.getRepository(StockItemEntity).findOne({ where: { tenantId, locationId, productId } });
    if (existing) return existing;
    return manager.getRepository(StockItemEntity).create({
      tenantId,
      locationId,
      productId,
      name: line.stockItem?.name ?? line.item?.name ?? 'Transferred item',
      sku: `${line.stockItem?.sku ?? productId.slice(0, 8)}-${locationId.slice(0, 4)}`,
      unit: line.stockItem?.unit ?? 'each',
      quantityOnHand: '0.0000',
      quantityReserved: '0.0000',
      reorderLevel: line.stockItem?.reorderLevel ?? null,
      isActive: true,
    });
  }

  private async appendMovement(manager: EntityManager, tenantId: string, stockItemId: string, type: StockMovementType, quantity: number, transferId: string, notes: string) {
    await manager.getRepository(StockMovementEntity).save(manager.getRepository(StockMovementEntity).create({
      tenantId,
      stockItemId,
      type,
      quantity: formatQty(quantity),
      source: StockMovementSource.TRANSFER,
      referenceType: StockReferenceType.TRANSFER,
      referenceId: transferId,
      notes,
    }));
  }

  private async notify(tenantId: string, transfer: StockTransferEntity, event: 'created' | 'shipped' | 'received') {
    try {
      await this.notifications.sendSystemNotification(tenantId, {
        type: NotificationType.SYSTEM,
        channel: NotificationChannelType.PUSH,
        payload: {
          templateName: `stock_transfer_${event}`,
          subject: `Stock transfer ${event}`,
          body: `Transfer ${transfer.id} from ${transfer.fromLocation?.name ?? transfer.fromLocationId} to ${transfer.toLocation?.name ?? transfer.toLocationId} was ${event}.`,
          transferId: transfer.id,
          status: transfer.status,
        },
      });
    } catch {
      // Notifications should never block warehouse stock movement.
    }
  }

  private toResponse(transfer: StockTransferEntity): StockTransferResponseDto {
    return {
      id: transfer.id,
      tenantId: transfer.tenantId,
      fromLocationId: transfer.fromLocationId,
      toLocationId: transfer.toLocationId,
      fromLocationName: transfer.fromLocation?.name ?? null,
      toLocationName: transfer.toLocation?.name ?? null,
      status: transfer.status,
      notes: transfer.notes,
      dispatchedAt: transfer.dispatchedAt,
      receivedAt: transfer.receivedAt,
      cancelledAt: transfer.cancelledAt,
      createdAt: transfer.createdAt,
      updatedAt: transfer.updatedAt,
      lines: (transfer.lines ?? []).map((line) => ({
        id: line.id,
        stockItemId: line.stockItemId,
        itemId: line.itemId,
        itemName: line.item?.name ?? line.stockItem?.name ?? null,
        quantity: line.quantity,
        quantityRequested: line.quantityRequested || line.quantity,
        quantitySent: line.quantitySent,
        quantityReceived: line.quantityReceived,
      })),
    };
  }
}
