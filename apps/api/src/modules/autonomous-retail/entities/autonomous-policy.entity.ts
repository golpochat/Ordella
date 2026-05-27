import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type AutonomyMode = 'fully_autonomous' | 'semi_autonomous' | 'suggestion_only';

@Entity('autonomous_policies')
@Index(['tenantId', 'locationId'], { unique: true })
export class AutonomousPolicyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId!: string | null;

  @Column({ type: 'varchar', length: 32, default: 'semi_autonomous' })
  mode!: AutonomyMode;

  @Column({ name: 'pricing_enabled', type: 'boolean', default: true })
  pricingEnabled!: boolean;

  @Column({ name: 'replenishment_enabled', type: 'boolean', default: true })
  replenishmentEnabled!: boolean;

  @Column({ name: 'staffing_enabled', type: 'boolean', default: true })
  staffingEnabled!: boolean;

  @Column({ name: 'promotion_enabled', type: 'boolean', default: true })
  promotionEnabled!: boolean;

  @Column({ name: 'delivery_enabled', type: 'boolean', default: true })
  deliveryEnabled!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  overrides!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
