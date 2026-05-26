import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DeliveryAssignmentEntity } from '../entities';
import { DeliveryAssignmentStatus } from '../enums/delivery-assignment-status.enum';

@Injectable()
export class DeliveryAssignmentRepository {
  constructor(
    @InjectRepository(DeliveryAssignmentEntity)
    private readonly repository: Repository<DeliveryAssignmentEntity>,
  ) {}

  private repo(manager?: EntityManager): Repository<DeliveryAssignmentEntity> {
    return manager ? manager.getRepository(DeliveryAssignmentEntity) : this.repository;
  }

  findAll(filter: { deliveryTaskId?: string; driverProfileId?: string; status?: DeliveryAssignmentStatus }) {
    return this.repository.find({
      where: {
        ...(filter.deliveryTaskId ? { deliveryTaskId: filter.deliveryTaskId } : {}),
        ...(filter.driverProfileId ? { driverProfileId: filter.driverProfileId } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      order: { createdAt: 'DESC' },
    });
  }

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  create(partial: Partial<DeliveryAssignmentEntity>, manager?: EntityManager): DeliveryAssignmentEntity {
    return this.repo(manager).create(partial);
  }

  save(assignment: DeliveryAssignmentEntity, manager?: EntityManager): Promise<DeliveryAssignmentEntity> {
    return this.repo(manager).save(assignment);
  }
}
