import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities';
import { BaseTenantRepository } from './base-tenant.repository';

@Injectable()
export class UserRepository extends BaseTenantRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    repository: Repository<UserEntity>,
  ) {
    super(repository);
  }

  // TODO: findByEmail(tenantId, email)
  // TODO: findByIdForTenant(tenantId, id)
  // TODO: createForTenant(tenantId, data)
  // TODO: updateForTenant(tenantId, id, data)
  // TODO: softDeleteForTenant(tenantId, id)
}
