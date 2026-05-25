import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type ReplenishmentRuleType = 'min_max' | 'forecast_based' | 'safety_stock';

@Entity('replenishment_rules')
@Index(['tenantId', 'locationId', 'itemId'])
export class ReplenishmentRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ name: 'item_id', type: 'uuid' })
  itemId!: string;

  @Column({ name: 'rule_type', type: 'varchar', length: 32 })
  ruleType!: ReplenishmentRuleType;

  @Column({ name: 'min_level', type: 'decimal', precision: 14, scale: 4, nullable: true })
  minLevel!: string | null;

  @Column({ name: 'max_level', type: 'decimal', precision: 14, scale: 4, nullable: true })
  maxLevel!: string | null;

  @Column({ name: 'safety_stock', type: 'decimal', precision: 14, scale: 4, nullable: true })
  safetyStock!: string | null;

  @Column({ name: 'reorder_multiple', type: 'decimal', precision: 14, scale: 4, nullable: true })
  reorderMultiple!: string | null;

  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  supplierId!: string | null;

  @Column({ name: 'source_location_id', type: 'uuid', nullable: true })
  sourceLocationId!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
