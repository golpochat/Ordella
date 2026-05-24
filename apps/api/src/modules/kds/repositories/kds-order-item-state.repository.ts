import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { KdsOrderItemStateEntity } from '../entities/kds-order-item-state.entity';
import { KdsLineStatus } from '../enums/kds-line-status.enum';

@Injectable()
export class KdsOrderItemStateRepository {
  constructor(
    @InjectRepository(KdsOrderItemStateEntity)
    private readonly repository: Repository<KdsOrderItemStateEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<KdsOrderItemStateEntity> {
    return manager ? manager.getRepository(KdsOrderItemStateEntity) : this.repository;
  }

  findByOrderForTenant(
    tenantId: string,
    orderId: string,
    manager?: EntityManager,
  ): Promise<KdsOrderItemStateEntity[]> {
    return this.repo(manager).find({
      where: { tenantId, orderId },
      order: { createdAt: 'ASC' },
    });
  }

  findByOrderItemForTenant(
    tenantId: string,
    orderItemId: string,
    manager?: EntityManager,
  ): Promise<KdsOrderItemStateEntity | null> {
    return this.repo(manager).findOne({ where: { tenantId, orderItemId } });
  }

  findByOrdersForTenant(
    tenantId: string,
    orderIds: string[],
    manager?: EntityManager,
  ): Promise<KdsOrderItemStateEntity[]> {
    if (!orderIds.length) {
      return Promise.resolve([]);
    }
    return this.repo(manager).find({
      where: { tenantId, orderId: In(orderIds) },
    });
  }

  create(
    partial: Partial<KdsOrderItemStateEntity>,
    manager?: EntityManager,
  ): KdsOrderItemStateEntity {
    return this.repo(manager).create(partial);
  }

  save(
    entity: KdsOrderItemStateEntity,
    manager?: EntityManager,
  ): Promise<KdsOrderItemStateEntity> {
    return this.repo(manager).save(entity);
  }

  saveMany(
    entities: KdsOrderItemStateEntity[],
    manager?: EntityManager,
  ): Promise<KdsOrderItemStateEntity[]> {
    return this.repo(manager).save(entities);
  }

  async ensurePendingForItems(
    tenantId: string,
    orderId: string,
    orderItemIds: string[],
    manager?: EntityManager,
  ): Promise<KdsOrderItemStateEntity[]> {
    const existing = await this.findByOrderForTenant(tenantId, orderId, manager);
    const existingIds = new Set(existing.map((row) => row.orderItemId));
    const toCreate = orderItemIds
      .filter((id) => !existingIds.has(id))
      .map((orderItemId) =>
        this.create(
          {
            tenantId,
            orderId,
            orderItemId,
            status: KdsLineStatus.PENDING,
            station: null,
            startedAt: null,
            completedAt: null,
          },
          manager,
        ),
      );

    if (toCreate.length) {
      const saved = await this.saveMany(toCreate, manager);
      return [...existing, ...saved];
    }

    return existing;
  }
}
