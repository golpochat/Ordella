import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FilterPaginationDto } from '../../../common/dto';
import { OrderEntity } from '../entities';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repository: Repository<OrderEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<OrderEntity> {
    return manager ? manager.getRepository(OrderEntity) : this.repository;
  }

  findAllForTenant(
    tenantId: string,
    query: FilterPaginationDto,
  ): Promise<OrderEntity[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return this.repository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findByIdForTenant(
    tenantId: string,
    id: string,
    manager?: EntityManager,
  ): Promise<OrderEntity | null> {
    return this.repo(manager).findOne({ where: { id, tenantId } });
  }

  findByIdWithItems(
    tenantId: string,
    id: string,
    manager?: EntityManager,
  ): Promise<OrderEntity | null> {
    return this.repo(manager).findOne({
      where: { id, tenantId },
      relations: ['items', 'taxLines'],
    });
  }

  save(order: OrderEntity, manager?: EntityManager): Promise<OrderEntity> {
    return this.repo(manager).save(order);
  }

  create(partial: Partial<OrderEntity>, manager?: EntityManager): OrderEntity {
    return this.repo(manager).create(partial);
  }
}
