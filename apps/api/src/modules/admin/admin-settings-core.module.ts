import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from '../tenants/entities/tenant.entity';
import { LocationEntity } from '../tenants/entities/location.entity';
import { LocationSettingsEntity } from '../tenants/entities/location-settings.entity';
import { LocationOpeningHoursEntity } from '../tenants/entities/location-opening-hours.entity';
import { TenantSettingsEntity } from '../onboarding/entities/tenant-settings.entity';
import { AdminSettingsRepository } from './repositories/admin-settings.repository';

/** Location settings persistence without pulling in OrdersFeatureModule (avoids Admin ↔ KDS cycles). */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantEntity,
      TenantSettingsEntity,
      LocationEntity,
      LocationSettingsEntity,
      LocationOpeningHoursEntity,
    ]),
  ],
  providers: [AdminSettingsRepository],
  exports: [AdminSettingsRepository],
})
export class AdminSettingsCoreModule {}
