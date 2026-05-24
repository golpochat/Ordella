import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { LocationOpeningHoursEntity } from '../entities';

@Injectable()
export class LocationOpeningHoursRepository {
  constructor(
    @InjectRepository(LocationOpeningHoursEntity)
    private readonly repository: Repository<LocationOpeningHoursEntity>,
  ) {}

  findByLocationId(locationId: string): Promise<LocationOpeningHoursEntity[]> {
    return this.repository.find({
      where: { locationId },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async replaceForLocation(
    locationId: string,
    hours: Array<Partial<LocationOpeningHoursEntity>>,
    manager?: EntityManager,
  ): Promise<LocationOpeningHoursEntity[]> {
    const repo = manager ? manager.getRepository(LocationOpeningHoursEntity) : this.repository;
    await repo.delete({ locationId });
    const rows = hours.map((entry) =>
      repo.create({
        locationId,
        dayOfWeek: entry.dayOfWeek!,
        openTime: entry.openTime ?? null,
        closeTime: entry.closeTime ?? null,
        isClosed: entry.isClosed ?? false,
      }),
    );
    return repo.save(rows);
  }
}
