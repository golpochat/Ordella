import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DeliveryStatusHistoryEntity } from '../entities';
import { DeliveryTaskStatus } from '../enums/delivery-task-status.enum';

@Injectable()
export class DeliveryStatusHistoryRepository {
  constructor(
    @InjectRepository(DeliveryStatusHistoryEntity)
    private readonly repository: Repository<DeliveryStatusHistoryEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<DeliveryStatusHistoryEntity> {
    return manager ? manager.getRepository(DeliveryStatusHistoryEntity) : this.repository;
  }

  append(
    deliveryTaskId: string,
    fromStatus: DeliveryTaskStatus | null,
    toStatus: DeliveryTaskStatus,
    reason: string | null,
    metadata: Record<string, unknown>,
    manager?: EntityManager,
  ): Promise<DeliveryStatusHistoryEntity> {
    const row = this.repo(manager).create({
      deliveryTaskId,
      fromStatus,
      toStatus,
      reason,
      metadata,
      changedBy: null,
    });
    return this.repo(manager).save(row);
  }
}
