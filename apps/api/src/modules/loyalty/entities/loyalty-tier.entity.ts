import { Column, Entity, Index } from 'typeorm';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';

@Entity('loyalty_tiers')
@Index(['tenantId', 'name'], { unique: true })
export class LoyaltyTierEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 80 })
  name!: string;

  @Column({ name: 'points_threshold', type: 'int', default: 0 })
  pointsThreshold!: number;

  @Column({ name: 'spend_threshold', type: 'decimal', precision: 12, scale: 2, default: 0 })
  spendThreshold!: string;

  @Column({ name: 'points_multiplier', type: 'decimal', precision: 8, scale: 4, default: 1 })
  pointsMultiplier!: string;

  @Column({ name: 'discount_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent!: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  perks!: string[];

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
