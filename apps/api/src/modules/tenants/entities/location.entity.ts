import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { LocationStatus } from '../enums/location-status.enum';
import { LocationType } from '../enums/location-type.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { TenantEntity } from './tenant.entity';
import { StoreEntity } from './store.entity';
import { LocationSettingsEntity } from './location-settings.entity';
import { LocationOpeningHoursEntity } from './location-opening-hours.entity';

/** ERD §1.1 — locations */
@Entity('locations')
@Index(['tenantId', 'name'])
export class LocationEntity extends BaseTenantScopedEntity {
  @Column({ name: 'store_id', type: 'uuid', nullable: true })
  storeId!: string | null;

  @ManyToOne(() => StoreEntity, (store) => store.locations, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'store_id' })
  store!: StoreEntity | null;

  @ManyToOne(() => TenantEntity, (tenant) => tenant.locations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: TenantEntity;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', length: 64, default: 'UTC' })
  timezone!: string;

  @Column({ type: 'varchar', length: 32, default: LocationStatus.CLOSED })
  status!: LocationStatus;

  @Column({ name: 'location_type', type: 'varchar', length: 32, default: LocationType.STORE })
  locationType!: LocationType;

  @OneToOne(() => LocationSettingsEntity, (settings) => settings.location)
  settings!: LocationSettingsEntity;

  @OneToMany(() => LocationOpeningHoursEntity, (hours) => hours.location)
  openingHours!: LocationOpeningHoursEntity[];
}
