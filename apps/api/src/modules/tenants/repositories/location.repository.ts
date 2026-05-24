import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationEntity } from '../entities';
import { LocationStatus } from '../enums/location-status.enum';

@Injectable()
export class LocationRepository {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly repository: Repository<LocationEntity>,
  ) {}

  findAllForTenant(tenantId: string): Promise<LocationEntity[]> {
    return this.repository.find({
      where: { tenantId },
      order: { createdAt: 'ASC' },
    });
  }

  findByIdForTenant(tenantId: string, id: string): Promise<LocationEntity | null> {
    return this.repository.findOne({ where: { id, tenantId } });
  }

  countForTenant(tenantId: string): Promise<number> {
    return this.repository.count({ where: { tenantId } });
  }

  save(entity: Partial<LocationEntity>): Promise<LocationEntity> {
    return this.repository.save(entity);
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: LocationStatus,
  ): Promise<LocationEntity | null> {
    const location = await this.findByIdForTenant(tenantId, id);
    if (!location) {
      return null;
    }
    location.status = status;
    return this.repository.save(location);
  }

  async remove(tenantId: string, id: string): Promise<boolean> {
    const result = await this.repository.delete({ id, tenantId });
    return (result.affected ?? 0) > 0;
  }
}
