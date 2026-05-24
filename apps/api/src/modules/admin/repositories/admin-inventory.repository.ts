import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockItemEntity } from '../../inventory/entities/stock-item.entity';
import { StockMovementEntity } from '../../inventory/entities/stock-movement.entity';
import { availableQty } from '../../inventory/domain/stock-quantity.util';

export interface AdminStockListFilter {
  locationId?: string;
  page?: number;
  limit?: number;
}

export interface AdminMovementListFilter {
  stockItemId?: string;
  locationId?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class AdminInventoryRepository {
  constructor(
    @InjectRepository(StockItemEntity)
    private readonly stockItemRepository: Repository<StockItemEntity>,
    @InjectRepository(StockMovementEntity)
    private readonly movementRepository: Repository<StockMovementEntity>,
  ) {}

  listStockLevels(tenantId: string, filter: AdminStockListFilter) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 100;

    return this.stockItemRepository.find({
      where: {
        tenantId,
        ...(filter.locationId ? { locationId: filter.locationId } : {}),
      },
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findStockItem(tenantId: string, id: string): Promise<StockItemEntity | null> {
    return this.stockItemRepository.findOne({ where: { id, tenantId } });
  }

  listMovements(tenantId: string, filter: AdminMovementListFilter) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 100;

    const qb = this.movementRepository
      .createQueryBuilder('movement')
      .where('movement.tenantId = :tenantId', { tenantId })
      .orderBy('movement.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filter.stockItemId) {
      qb.andWhere('movement.stockItemId = :stockItemId', { stockItemId: filter.stockItemId });
    }

    if (filter.from && filter.to) {
      qb.andWhere('movement.createdAt BETWEEN :from AND :to', {
        from: filter.from,
        to: filter.to,
      });
    }

    return qb.getMany();
  }

  static toStockView(item: StockItemEntity) {
    return {
      id: item.id,
      tenantId: item.tenantId,
      locationId: item.locationId,
      productId: item.productId,
      name: item.name,
      sku: item.sku,
      unit: item.unit,
      quantityOnHand: item.quantityOnHand,
      quantityReserved: item.quantityReserved,
      quantityAvailable: availableQty(item.quantityOnHand, item.quantityReserved).toFixed(4),
    };
  }
}
