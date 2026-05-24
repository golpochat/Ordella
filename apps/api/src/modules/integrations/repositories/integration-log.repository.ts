import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationLogEntity } from '../entities/integration-log.entity';

@Injectable()
export class IntegrationLogRepository {
  constructor(
    @InjectRepository(IntegrationLogEntity)
    private readonly repository: Repository<IntegrationLogEntity>,
  ) {}

  // TODO: findAllForTenant with filters
}
