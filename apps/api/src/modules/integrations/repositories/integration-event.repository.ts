import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationEventEntity } from '../entities/integration-event.entity';

@Injectable()
export class IntegrationEventRepository {
  constructor(
    @InjectRepository(IntegrationEventEntity)
    private readonly repository: Repository<IntegrationEventEntity>,
  ) {}

  // TODO: findAllForTenant with filters, findById
}
