import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { StockItemEntity } from '../entities';

@Injectable()
export class StockItemRepository {
  constructor(
    @InjectRepository(StockItemEntity)
    private readonly repository: Repository<StockItemEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<StockItemEntity> {
    return manager ? manager.getRepository(StockItemEntity) : this.repository;
  }

  findByIdForTenant(
    tenantId: string,
    id: string,
    manager?: EntityManager,
    lock = false,
  ): Promise<StockItemEntity | null> {
    const qb = this.repo(manager)
      .createQueryBuilder('item')
      .where('item.id = :id', { id })
      .andWhere('item.tenantId = :tenantId', { tenantId });

    if (lock) {
      qb.setLock('pessimistic_write');
    }

    return qb.getOne();
  }

  findByProductForTenant(
    tenantId: string,
    locationId: string,
    productId: string,
    manager?: EntityManager,
    lock = false,
  ): Promise<StockItemEntity | null> {
    const qb = this.repo(manager)
      .createQueryBuilder('item')
      .where('item.tenantId = :tenantId', { tenantId })
      .andWhere('item.locationId = :locationId', { locationId })
      .andWhere('item.productId = :productId', { productId });

    if (lock) {
      qb.setLock('pessimistic_write');
    }

    return qb.getOne();
  }

  save(item: StockItemEntity, manager?: EntityManager): Promise<StockItemEntity> {
    return this.repo(manager).save(item);
  }

  create(partial: Partial<StockItemEntity>, manager?: EntityManager): StockItemEntity {
    return this.repo(manager).create(partial);
  }
}
