import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationEntity } from '../entities/integration.entity';

@Injectable()
export class IntegrationRepository {
  constructor(
    @InjectRepository(IntegrationEntity)
    private readonly repository: Repository<IntegrationEntity>,
  ) {}

  // TODO: findAllForTenant, findByIdForTenant, create, update, remove
}
