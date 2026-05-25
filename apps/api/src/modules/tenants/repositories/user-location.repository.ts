import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserLocationAssignmentEntity } from '../entities/user-location-assignment.entity';

@Injectable()
export class UserLocationRepository {
  constructor(
    @InjectRepository(UserLocationAssignmentEntity)
    private readonly repository: Repository<UserLocationAssignmentEntity>,
  ) {}

  countStaffForLocation(tenantId: string, locationId: string): Promise<number> {
    return this.repository.count({ where: { tenantId, locationId } });
  }

  listUserIdsForLocation(tenantId: string, locationId: string): Promise<string[]> {
    return this.repository
      .find({ where: { tenantId, locationId }, select: ['userId'] })
      .then((rows) => rows.map((row) => row.userId));
  }

  async replaceAssignments(
    tenantId: string,
    locationId: string,
    userIds: string[],
  ): Promise<void> {
    await this.repository.delete({ tenantId, locationId });
    if (userIds.length === 0) {
      return;
    }
    const rows = userIds.map((userId) =>
      this.repository.create({ tenantId, locationId, userId }),
    );
    await this.repository.save(rows);
  }

  async replaceAssignmentsForUser(
    tenantId: string,
    userId: string,
    locationIds: string[],
  ): Promise<void> {
    await this.repository.delete({ tenantId, userId });
    if (locationIds.length === 0) {
      return;
    }
    const rows = [...new Set(locationIds)].map((locationId) =>
      this.repository.create({ tenantId, locationId, userId }),
    );
    await this.repository.save(rows);
  }

  listLocationsForUser(tenantId: string, userId: string): Promise<string[]> {
    return this.repository
      .find({ where: { tenantId, userId }, select: ['locationId'] })
      .then((rows) => rows.map((row) => row.locationId));
  }

  async removeUserFromLocation(
    tenantId: string,
    locationId: string,
    userId: string,
  ): Promise<void> {
    await this.repository.delete({ tenantId, locationId, userId });
  }
}
