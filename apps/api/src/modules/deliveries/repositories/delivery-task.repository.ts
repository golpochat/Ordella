import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DeliveryTaskEntity } from '../entities';

@Injectable()
export class DeliveryTaskRepository {
  constructor(
    @InjectRepository(DeliveryTaskEntity)
    private readonly repository: Repository<DeliveryTaskEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<DeliveryTaskEntity> {
    return manager ? manager.getRepository(DeliveryTaskEntity) : this.repository;
  }

  findByIdForTenant(
    tenantId: string,
    id: string,
    manager?: EntityManager,
    lock = false,
  ): Promise<DeliveryTaskEntity | null> {
    const qb = this.repo(manager)
      .createQueryBuilder('task')
      .where('task.id = :id', { id })
      .andWhere('task.tenantId = :tenantId', { tenantId });

    if (lock) {
      qb.setLock('pessimistic_write');
    }

    return qb.getOne();
  }

  findByOrderForTenant(
    tenantId: string,
    orderId: string,
    manager?: EntityManager,
    lock = false,
  ): Promise<DeliveryTaskEntity | null> {
    const qb = this.repo(manager)
      .createQueryBuilder('task')
      .where('task.tenantId = :tenantId', { tenantId })
      .andWhere('task.orderId = :orderId', { orderId });

    if (lock) {
      qb.setLock('pessimistic_write');
    }

    return qb.getOne();
  }

  save(task: DeliveryTaskEntity, manager?: EntityManager): Promise<DeliveryTaskEntity> {
    return this.repo(manager).save(task);
  }

  create(partial: Partial<DeliveryTaskEntity>, manager?: EntityManager): DeliveryTaskEntity {
    return this.repo(manager).create(partial);
  }
}
