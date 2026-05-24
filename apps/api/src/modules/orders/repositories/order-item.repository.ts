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

  findByOrderId(orderId: string, manager?: EntityManager): Promise<OrderItemEntity[]> {
    return this.repo(manager).find({ where: { orderId } });
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
