import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EnterpriseOrganizationEntity } from './enterprise-organization.entity';

@Entity('enterprise_regions')
@Index(['tenantId', 'organizationId', 'name'])
export class EnterpriseRegionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @ManyToOne(() => EnterpriseOrganizationEntity, (organization) => organization.regions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: EnterpriseOrganizationEntity;

  @Column({ name: 'parent_region_id', type: 'uuid', nullable: true })
  parentRegionId!: string | null;

  @ManyToOne(() => EnterpriseRegionEntity, (region) => region.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_region_id' })
  parentRegion!: EnterpriseRegionEntity | null;

  @OneToMany(() => EnterpriseRegionEntity, (region) => region.parentRegion)
  children!: EnterpriseRegionEntity[];

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ name: 'region_type', type: 'varchar', length: 32, default: 'custom' })
  regionType!: 'country' | 'state' | 'custom';

  @Column({ type: 'varchar', length: 2, nullable: true })
  country!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  state!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  overrides!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
