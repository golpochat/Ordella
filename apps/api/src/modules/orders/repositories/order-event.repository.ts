import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FilterPaginationDto } from '../../../common/dto';
import { OrderEventEntity } from '../entities';

@Injectable()
export class OrderEventRepository {
  constructor(
    @InjectRepository(OrderEventEntity)
    private readonly repository: Repository<OrderEventEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<OrderEventEntity> {
    return manager ? manager.getRepository(OrderEventEntity) : this.repository;
  }

  findByOrderIdForTenant(
    tenantId: string,
    orderId: string,
    query: FilterPaginationDto,
  ): Promise<OrderEventEntity[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return this.repository
      .createQueryBuilder('event')
      .innerJoin('event.order', 'order')
      .where('event.orderId = :orderId', { orderId })
      .andWhere('order.tenantId = :tenantId', { tenantId })
      .orderBy('event.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }

  appendEvent(
    orderId: string,
    eventType: string,
    metadata: Record<string, unknown>,
    manager?: EntityManager,
  ): Promise<OrderEventEntity> {
    const entry = this.repo(manager).create({
      orderId,
      eventType,
      metadata,
    });
    return this.repo(manager).save(entry);
  }
}
