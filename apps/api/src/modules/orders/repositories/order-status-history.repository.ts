import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FilterPaginationDto } from '../../../common/dto';
import { OrderStatusHistoryEntity } from '../entities';
import { OrderStatus } from '../enums/order-status.enum';

@Injectable()
export class OrderStatusHistoryRepository {
  constructor(
    @InjectRepository(OrderStatusHistoryEntity)
    private readonly repository: Repository<OrderStatusHistoryEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<OrderStatusHistoryEntity> {
    return manager
      ? manager.getRepository(OrderStatusHistoryEntity)
      : this.repository;
  }

  findByOrderId(
    orderId: string,
    query: FilterPaginationDto,
  ): Promise<OrderStatusHistoryEntity[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return this.repository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  appendTransition(
    orderId: string,
    fromStatus: OrderStatus | null,
    toStatus: OrderStatus,
    changedBy: string | null,
    reason: string | null,
    manager?: EntityManager,
  ): Promise<OrderStatusHistoryEntity> {
    const entry = this.repo(manager).create({
      orderId,
      fromStatus,
      toStatus,
      changedBy,
      reason,
    });
    return this.repo(manager).save(entry);
  }
}
