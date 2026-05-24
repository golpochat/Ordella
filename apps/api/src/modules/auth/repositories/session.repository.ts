import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from '../entities';
import { BaseTenantRepository } from './base-tenant.repository';

@Injectable()
export class SessionRepository extends BaseTenantRepository<SessionEntity> {
  constructor(
    @InjectRepository(SessionEntity)
    repository: Repository<SessionEntity>,
  ) {
    super(repository);
  }

  // TODO: findActiveForUser(tenantId, userId)
  // TODO: revokeById(tenantId, sessionId)
  // TODO: createSession(data)
}
