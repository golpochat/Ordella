import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EnterpriseRegionEntity } from './enterprise-region.entity';

@Entity('enterprise_organizations')
@Index(['tenantId', 'slug'], { unique: true })
export class EnterpriseOrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'varchar', length: 160 })
  slug!: string;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status!: string;

  @Column({ name: 'global_settings', type: 'jsonb', default: () => "'{}'" })
  globalSettings!: Record<string, unknown>;

  @Column({ name: 'tax_rules', type: 'jsonb', default: () => "'{}'" })
  taxRules!: Record<string, unknown>;

  @Column({ name: 'promotion_policy', type: 'jsonb', default: () => "'{}'" })
  promotionPolicy!: Record<string, unknown>;

  @Column({ name: 'catalog_policy', type: 'jsonb', default: () => "'{}'" })
  catalogPolicy!: Record<string, unknown>;

  @Column({ name: 'sso_policy', type: 'jsonb', default: () => "'{}'" })
  ssoPolicy!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;

  @OneToMany(() => EnterpriseRegionEntity, (region) => region.organization)
  regions!: EnterpriseRegionEntity[];
}
