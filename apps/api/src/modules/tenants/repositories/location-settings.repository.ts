import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { LocationSettingsEntity } from '../entities';

@Injectable()
export class LocationSettingsRepository {
  constructor(
    @InjectRepository(LocationSettingsEntity)
    private readonly repository: Repository<LocationSettingsEntity>,
  ) {}

  findByLocationId(locationId: string): Promise<LocationSettingsEntity | null> {
    return this.repository.findOne({ where: { locationId } });
  }

  async upsertForLocation(
    locationId: string,
    settings: Record<string, unknown>,
    manager?: EntityManager,
  ): Promise<LocationSettingsEntity> {
    const repo = manager ? manager.getRepository(LocationSettingsEntity) : this.repository;
    let row = await repo.findOne({ where: { locationId } });
    if (!row) {
      row = repo.create({ locationId, settings });
    } else {
      row.settings = { ...row.settings, ...settings };
    }
    return repo.save(row);
  }

  async mergeSettings(
    locationId: string,
    patch: Record<string, unknown>,
    manager?: EntityManager,
  ): Promise<LocationSettingsEntity> {
    const existing = await this.findByLocationId(locationId);
    const merged = { ...(existing?.settings ?? {}), ...patch };
    return this.upsertForLocation(locationId, merged, manager);
  }
}
