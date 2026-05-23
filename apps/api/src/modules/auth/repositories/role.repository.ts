import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../entities/role.entity';
import { BaseTenantRepository } from './base-tenant.repository';

@Injectable()
export class RoleRepository extends BaseTenantRepository<RoleEntity> {
  constructor(
    @InjectRepository(RoleEntity)
    repository: Repository<RoleEntity>,
  ) {
    super(repository);
  }

  // TODO: findAllForTenant(tenantId)
  // TODO: assignPermissions(roleId, permissionIds)
}
