import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreEntity } from '../entities/store.entity';

@Injectable()
export class StoreRepository {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly repository: Repository<StoreEntity>,
  ) {}

  // TODO: findAllForTenant(tenantId)
  // TODO: findByIdForTenant(tenantId, id)
  // TODO: createForTenant, updateForTenant, removeForTenant
}
