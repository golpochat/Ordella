import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryAssignmentEntity } from '../entities';

@Injectable()
export class DeliveryAssignmentRepository {
  constructor(
    @InjectRepository(DeliveryAssignmentEntity)
    private readonly repository: Repository<DeliveryAssignmentEntity>,
  ) {}

  // TODO: findAllForTenant, findByIdForTenant, create, update
}
