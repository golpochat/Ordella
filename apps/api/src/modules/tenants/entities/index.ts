import { LocationOpeningHoursEntity } from './location-opening-hours.entity';
import { LocationSettingsEntity } from './location-settings.entity';
import { LocationEntity } from './location.entity';
import { StoreEntity } from './store.entity';
import { TenantEntity } from './tenant.entity';
import { UserLocationAssignmentEntity } from './user-location-assignment.entity';
import { FranchiseGroupEntity } from './franchise-group.entity';
import { BrandGroupEntity } from './brand-group.entity';

export { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
export { UserLocationAssignmentEntity } from './user-location-assignment.entity';
export { BaseTimestampsEntity } from './base-timestamps.entity';
export { LocationOpeningHoursEntity } from './location-opening-hours.entity';
export { LocationSettingsEntity } from './location-settings.entity';
export { LocationEntity } from './location.entity';
export { StoreEntity } from './store.entity';
export { TenantEntity } from './tenant.entity';
export { FranchiseGroupEntity } from './franchise-group.entity';
export { BrandGroupEntity } from './brand-group.entity';
export type { TenantType } from './tenant.entity';
export { LocationType } from '../enums/location-type.enum';

export const TENANTS_ENTITIES = [
  LocationOpeningHoursEntity,
  LocationSettingsEntity,
  LocationEntity,
  StoreEntity,
  TenantEntity,
  UserLocationAssignmentEntity,
  FranchiseGroupEntity,
  BrandGroupEntity,
];
