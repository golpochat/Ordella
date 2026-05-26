import { Column, Entity, Index } from 'typeorm';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';

export type LoyaltyRewardType = 'voucher' | 'discount' | 'free_item';

@Entity('loyalty_rewards')
@Index(['tenantId', 'isActive'])
export class LoyaltyRewardEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 32 })
  type!: LoyaltyRewardType;

  @Column({ name: 'points_cost', type: 'int', default: 0 })
  pointsCost!: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  discountAmount!: string | null;

  @Column({ name: 'discount_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercent!: string | null;

  @Column({ name: 'free_item_id', type: 'uuid', nullable: true })
  freeItemId!: string | null;

  @Column({ name: 'tier_names', type: 'text', array: true, default: () => "'{}'" })
  tierNames!: string[];

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;
}
