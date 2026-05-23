import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TENANTS_ENTITIES } from './entities';
import { TenantsFeatureModule } from './modules/tenants/tenants-feature.module';
import { StoresModule } from './modules/stores/stores.module';
import { LocationsFeatureModule } from './modules/locations/locations.module';

/**
 * Tenants domain — multi-tenant org structure (SRS §2, API Spec §2).
 *
 * Routes (/api/v1):
 * - /tenants              — platform tenant CRUD
 * - /stores               — tenant-scoped stores (SRS)
 * - /locations            — tenant-scoped locations
 * - /locations/:id/settings, /hours, /status
 */
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature(TENANTS_ENTITIES),
    TenantsFeatureModule,
    StoresModule,
    LocationsFeatureModule,
  ],
  exports: [TenantsFeatureModule, StoresModule, LocationsFeatureModule, TypeOrmModule],
})
export class TenantsModule {}
