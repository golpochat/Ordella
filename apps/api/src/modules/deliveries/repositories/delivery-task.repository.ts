import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Repository } from 'typeorm';
import { DeliveryTaskEntity } from '../entities';
import { DeliveryTaskStatus } from '../enums/delivery-task-status.enum';

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

  findAllForTenant(
    tenantId: string,
    options?: {
      driverId?: string;
      status?: DeliveryTaskStatus;
      unassignedOnly?: boolean;
    },
  ): Promise<DeliveryTaskEntity[]> {
    return this.repository.find({
      where: {
        tenantId,
        ...(options?.driverId ? { driverId: options.driverId } : {}),
        ...(options?.status ? { status: options.status } : {}),
        ...(options?.unassignedOnly ? { driverId: IsNull() } : {}),
      },
      order: { createdAt: 'DESC' },
    });
  }

  findAssignedForDriver(
    tenantId: string,
    driverId: string,
  ): Promise<DeliveryTaskEntity[]> {
    return this.repository.find({
      where: {
        tenantId,
        driverId,
        status: In([
          DeliveryTaskStatus.ASSIGNED,
          DeliveryTaskStatus.EN_ROUTE,
          DeliveryTaskStatus.PENDING,
        ]),
      },
      order: { createdAt: 'ASC' },
    });
  }

  findAvailableForTenant(tenantId: string): Promise<DeliveryTaskEntity[]> {
    return this.repository.find({
      where: {
        tenantId,
        driverId: IsNull(),
        status: DeliveryTaskStatus.PENDING,
      },
      order: { createdAt: 'ASC' },
    });
  }

  findCompletedForDriver(
    tenantId: string,
    driverId: string,
    limit = 50,
  ): Promise<DeliveryTaskEntity[]> {
    return this.repository.find({
      where: {
        tenantId,
        driverId,
        status: In([
          DeliveryTaskStatus.DELIVERED,
          DeliveryTaskStatus.CANCELLED,
          DeliveryTaskStatus.FAILED,
        ]),
      },
      order: { completedAt: 'DESC' },
      take: limit,
    });
  }

  findByOrderIds(tenantId: string, orderIds: string[]): Promise<DeliveryTaskEntity[]> {
    if (!orderIds.length) {
      return Promise.resolve([]);
    }
    return this.repository.find({
      where: { tenantId, orderId: In(orderIds) },
    });
  }
}
