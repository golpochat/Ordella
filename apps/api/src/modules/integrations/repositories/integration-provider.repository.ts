import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationProviderEntity } from '../entities/integration-provider.entity';

@Injectable()
export class IntegrationProviderRepository {
  constructor(
    @InjectRepository(IntegrationProviderEntity)
    private readonly repository: Repository<IntegrationProviderEntity>,
  ) {}

  // TODO: findAllActive, findBySlug, create, update
}
