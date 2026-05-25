import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeyEntity } from '../entities';
import { BaseTenantRepository } from './base-tenant.repository';

@Injectable()
export class ApiKeyRepository extends BaseTenantRepository<ApiKeyEntity> {
  constructor(
    @InjectRepository(ApiKeyEntity)
    repository: Repository<ApiKeyEntity>,
  ) {
    super(repository);
  }

  findByPrefix(prefix: string): Promise<ApiKeyEntity | null> {
    return this.repository.findOne({ where: { keyPrefix: prefix } });
  }

  listForTenant(tenantId: string, skip = 0, take = 50): Promise<ApiKeyEntity[]> {
    return this.repository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  findByIdForTenant(tenantId: string, id: string): Promise<ApiKeyEntity | null> {
    return this.repository.findOne({ where: { id, tenantId } });
  }

  save(key: ApiKeyEntity): Promise<ApiKeyEntity> {
    return this.repository.save(key);
  }

  create(partial: Partial<ApiKeyEntity>): ApiKeyEntity {
    return this.repository.create(partial);
  }
}
