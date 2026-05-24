import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryTaskEntity } from '../entities/delivery-task.entity';

@Injectable()
export class DeliveryTaskRepository {
  constructor(
    @InjectRepository(DeliveryTaskEntity)
    private readonly repository: Repository<DeliveryTaskEntity>,
  ) {}

  // TODO: findAllForTenant, findByIdForTenant, create, update
}
