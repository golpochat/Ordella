import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type FeatureEntityType = 'customer' | 'product' | 'inventory' | 'delivery';

@Entity('feature_store_features')
@Index(['tenantId', 'entityType', 'entityId', 'featureKey'], { unique: true })
export class FeatureStoreFeatureEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 32 })
  entityType!: FeatureEntityType;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId!: string;

  @Column({ name: 'feature_key', type: 'varchar', length: 64 })
  featureKey!: string;

  @Column({ name: 'feature_value', type: 'jsonb', default: () => "'{}'" })
  featureValue!: Record<string, unknown>;

  @Column({ name: 'numeric_value', type: 'decimal', precision: 18, scale: 6, nullable: true })
  numericValue!: string | null;

  @Column({ name: 'computed_at', type: 'timestamptz' })
  computedAt!: Date;

  @Column({ name: 'valid_until', type: 'timestamptz', nullable: true })
  validUntil!: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;
}
