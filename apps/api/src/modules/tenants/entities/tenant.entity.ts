import { Column, Entity, OneToMany } from 'typeorm';
import { TenantStatus } from '../enums/tenant-status.enum';
import { BaseTimestampsEntity } from './base-timestamps.entity';
import { StoreEntity } from './store.entity';
import { LocationEntity } from './location.entity';

export type TenantType = 'hq' | 'franchisee' | 'single-location';

/** ERD §1.1 — root tenant (maps to existing `tenants` table) */
@Entity('tenants')
export class TenantEntity extends BaseTimestampsEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 32, default: TenantStatus.ACTIVE })
  status!: TenantStatus;

  @Column({ type: 'varchar', length: 128, nullable: true, unique: true })
  slug!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  subdomain!: string | null;

  @Column({ name: 'parent_tenant_id', type: 'uuid', nullable: true })
  parentTenantId!: string | null;

  @Column({ name: 'tenant_type', type: 'varchar', length: 32, default: 'single-location' })
  tenantType!: TenantType;

  @OneToMany(() => StoreEntity, (store) => store.tenant)
  stores!: StoreEntity[];

  @OneToMany(() => LocationEntity, (location) => location.tenant)
  locations!: LocationEntity[];
}
