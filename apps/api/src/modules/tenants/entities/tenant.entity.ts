import { Column, Entity, OneToMany } from 'typeorm';
import { TenantStatus } from '../enums/tenant-status.enum';
import { BaseTimestampsEntity } from './base-timestamps.entity';
import { StoreEntity } from './store.entity';
import { LocationEntity } from './location.entity';

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

  @OneToMany(() => StoreEntity, (store) => store.tenant)
  stores!: StoreEntity[];

  @OneToMany(() => LocationEntity, (location) => location.tenant)
  locations!: LocationEntity[];
}
