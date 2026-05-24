import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationEntity } from '../entities';

@Injectable()
export class LocationRepository {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly repository: Repository<LocationEntity>,
  ) {}

  // TODO: findAllForTenant(tenantId, filters)
  // TODO: findByIdForTenant(tenantId, id)
  // TODO: updateStatus(tenantId, id, status)
}
