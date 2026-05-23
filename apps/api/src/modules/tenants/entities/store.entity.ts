import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { StoreStatus } from '../enums/store-status.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { TenantEntity } from './tenant.entity';
import { LocationEntity } from './location.entity';

/** SRS §2.2 — Store (tenant → store → location) */
@Entity('stores')
@Index(['tenantId', 'name'], { unique: true })
export class StoreEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  slug!: string | null;

  @Column({ type: 'varchar', length: 32, default: StoreStatus.ACTIVE })
  status!: StoreStatus;

  @ManyToOne(() => TenantEntity, (tenant) => tenant.stores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: TenantEntity;

  @OneToMany(() => LocationEntity, (location) => location.store)
  locations!: LocationEntity[];
}
