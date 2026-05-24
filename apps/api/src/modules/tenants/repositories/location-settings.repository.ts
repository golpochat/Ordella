import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationSettingsEntity } from '../entities';

@Injectable()
export class LocationSettingsRepository {
  constructor(
    @InjectRepository(LocationSettingsEntity)
    private readonly repository: Repository<LocationSettingsEntity>,
  ) {}

  // TODO: findByLocationId(locationId)
  // TODO: upsertForLocation(locationId, settings)
}
