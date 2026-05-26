import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from '../../tenants/entities/tenant.entity';
import { LocationEntity } from '../../tenants/entities/location.entity';
import { LocationSettingsEntity } from '../../tenants/entities/location-settings.entity';
import { LocationOpeningHoursEntity } from '../../tenants/entities/location-opening-hours.entity';
import { TenantSettingsEntity } from '../../onboarding/entities/tenant-settings.entity';
import { throwAdminResourceNotFound } from '../domain/admin-domain.errors';

@Injectable()
export class AdminSettingsRepository {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
    @InjectRepository(TenantSettingsEntity)
    private readonly tenantSettingsRepository: Repository<TenantSettingsEntity>,
    @InjectRepository(LocationEntity)
    private readonly locationRepository: Repository<LocationEntity>,
    @InjectRepository(LocationSettingsEntity)
    private readonly settingsRepository: Repository<LocationSettingsEntity>,
    @InjectRepository(LocationOpeningHoursEntity)
    private readonly hoursRepository: Repository<LocationOpeningHoursEntity>,
  ) {}

  findTenant(tenantId: string): Promise<TenantEntity | null> {
    return this.tenantRepository.findOne({ where: { id: tenantId } });
  }

  saveTenant(tenant: TenantEntity): Promise<TenantEntity> {
    return this.tenantRepository.save(tenant);
  }

  saveLocation(location: LocationEntity): Promise<LocationEntity> {
    return this.locationRepository.save(location);
  }

  async getOrCreateTenantSettings(tenantId: string): Promise<TenantSettingsEntity> {
    let settings = await this.tenantSettingsRepository.findOne({ where: { tenantId } });
    if (!settings) {
      await this.requireTenant(tenantId);
      settings = this.tenantSettingsRepository.create({ tenantId });
      settings = await this.tenantSettingsRepository.save(settings);
    }
    return settings;
  }

  saveTenantSettings(settings: TenantSettingsEntity): Promise<TenantSettingsEntity> {
    return this.tenantSettingsRepository.save(settings);
  }

  private async requireTenant(tenantId: string): Promise<TenantEntity> {
    const tenant = await this.findTenant(tenantId);
    if (!tenant) {
      throwAdminResourceNotFound('tenant', tenantId);
    }
    return tenant;
  }

  async requireLocationForTenant(tenantId: string, locationId: string): Promise<LocationEntity> {
    const location = await this.locationRepository.findOne({
      where: { id: locationId, tenantId },
    });
    if (!location) {
      throwAdminResourceNotFound('location', locationId);
    }
    return location;
  }

  async getOrCreateSettings(locationId: string): Promise<LocationSettingsEntity> {
    let settings = await this.settingsRepository.findOne({ where: { locationId } });
    if (!settings) {
      settings = this.settingsRepository.create({ locationId, settings: {} });
      settings = await this.settingsRepository.save(settings);
    }
    return settings;
  }

  async mergeSettings(
    tenantId: string,
    locationId: string,
    patch: Record<string, unknown>,
  ): Promise<LocationSettingsEntity> {
    await this.requireLocationForTenant(tenantId, locationId);
    const row = await this.getOrCreateSettings(locationId);
    row.settings = { ...row.settings, ...patch };
    return this.settingsRepository.save(row);
  }

  listOpeningHours(locationId: string): Promise<LocationOpeningHoursEntity[]> {
    return this.hoursRepository.find({
      where: { locationId },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async replaceOpeningHours(
    tenantId: string,
    locationId: string,
    entries: Array<Partial<LocationOpeningHoursEntity>>,
  ): Promise<LocationOpeningHoursEntity[]> {
    await this.requireLocationForTenant(tenantId, locationId);
    await this.hoursRepository.delete({ locationId });
    const rows = entries.map((entry) =>
      this.hoursRepository.create({
        locationId,
        dayOfWeek: entry.dayOfWeek!,
        openTime: entry.openTime ?? null,
        closeTime: entry.closeTime ?? null,
        isClosed: entry.isClosed ?? false,
      }),
    );
    return this.hoursRepository.save(rows);
  }
}
