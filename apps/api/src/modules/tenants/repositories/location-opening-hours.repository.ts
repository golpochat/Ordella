import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationOpeningHoursEntity } from '../entities/location-opening-hours.entity';

@Injectable()
export class LocationOpeningHoursRepository {
  constructor(
    @InjectRepository(LocationOpeningHoursEntity)
    private readonly repository: Repository<LocationOpeningHoursEntity>,
  ) {}

  // TODO: findByLocationId(locationId)
  // TODO: replaceForLocation(locationId, hours)
}
