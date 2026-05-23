import { LocationEntity } from './location.entity';
import { LocationOpeningHoursEntity } from './location-opening-hours.entity';
import { LocationSettingsEntity } from './location-settings.entity';
import { StoreEntity } from './store.entity';
import { TenantEntity } from './tenant.entity';

export { LocationEntity } from './location.entity';
export { LocationOpeningHoursEntity } from './location-opening-hours.entity';
export { LocationSettingsEntity } from './location-settings.entity';
export { StoreEntity } from './store.entity';
export { TenantEntity } from './tenant.entity';

export const TENANTS_ENTITIES = [
  TenantEntity,
  StoreEntity,
  LocationEntity,
  LocationSettingsEntity,
  LocationOpeningHoursEntity,
];
