import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeyEntity } from '../entities/api-key.entity';
import { BaseTenantRepository } from './base-tenant.repository';

@Injectable()
export class ApiKeyRepository extends BaseTenantRepository<ApiKeyEntity> {
  constructor(
    @InjectRepository(ApiKeyEntity)
    repository: Repository<ApiKeyEntity>,
  ) {
    super(repository);
  }

  // TODO: findByPrefix(prefix)
  // TODO: listForTenant(tenantId)
  // TODO: revokeForTenant(tenantId, id)
}
