import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { OrderItemEntity } from '../entities';

@Injectable()
export class OrderItemRepository {
  constructor(
    @InjectRepository(OrderItemEntity)
    private readonly repository: Repository<OrderItemEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<OrderItemEntity> {
    return manager ? manager.getRepository(OrderItemEntity) : this.repository;
  }

  findById(id: string, manager?: EntityManager): Promise<OrderItemEntity | null> {
    return this.repo(manager).findOne({
      where: { id },
      relations: ['order'],
    });
  }

  findByIdForTenant(
    tenantId: string,
    id: string,
    manager?: EntityManager,
  ): Promise<OrderItemEntity | null> {
    return this.repo(manager)
      .createQueryBuilder('item')
      .innerJoinAndSelect('item.order', 'order')
      .where('item.id = :id', { id })
      .andWhere('order.tenantId = :tenantId', { tenantId })
      .getOne();
  }

  findByOrderId(orderId: string, manager?: EntityManager): Promise<OrderItemEntity[]> {
    return this.repo(manager).find({ where: { orderId } });
  }

  findByOrderIdForTenant(
    tenantId: string,
    orderId: string,
    manager?: EntityManager,
  ): Promise<OrderItemEntity[]> {
    return this.repo(manager)
      .createQueryBuilder('item')
      .innerJoin('item.order', 'order')
      .where('item.orderId = :orderId', { orderId })
      .andWhere('order.tenantId = :tenantId', { tenantId })
      .getMany();
  }

  save(item: OrderItemEntity, manager?: EntityManager): Promise<OrderItemEntity> {
    return this.repo(manager).save(item);
  }

  create(
    partial: Partial<OrderItemEntity>,
    manager?: EntityManager,
  ): OrderItemEntity {
    return this.repo(manager).create(partial);
  }

  async remove(item: OrderItemEntity, manager?: EntityManager): Promise<void> {
    await this.repo(manager).remove(item);
  }
}
