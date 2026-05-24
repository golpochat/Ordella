import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DeliveryEventEntity } from '../entities/delivery-event.entity';

@Injectable()
export class DeliveryEventRepository {
  constructor(
    @InjectRepository(DeliveryEventEntity)
    private readonly repository: Repository<DeliveryEventEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<DeliveryEventEntity> {
    return manager ? manager.getRepository(DeliveryEventEntity) : this.repository;
  }

  append(
    tenantId: string,
    deliveryTaskId: string,
    type: string,
    payload: Record<string, unknown>,
    manager?: EntityManager,
  ): Promise<DeliveryEventEntity> {
    const event = this.repo(manager).create({
      tenantId,
      deliveryTaskId,
      type,
      payload,
    });
    return this.repo(manager).save(event);
  }
}
