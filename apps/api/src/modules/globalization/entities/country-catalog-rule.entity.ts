import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('country_catalog_rules')
@Index(['tenantId', 'countryCode', 'entityType', 'entityId'])
export class CountryCatalogRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'country_code', type: 'varchar', length: 2 })
  countryCode!: string;

  @Column({ name: 'region_code', type: 'varchar', length: 64, nullable: true })
  regionCode!: string | null;

  @Column({ name: 'entity_type', type: 'varchar', length: 32 })
  entityType!: 'product' | 'category';

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId!: string;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  overrides!: Record<string, unknown>;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
