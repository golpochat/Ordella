import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { CustomerEntity } from './customer.entity';

@Entity('loyalty_points')
@Index(['tenantId', 'customerId'], { unique: true })
export class LoyaltyPointsEntity extends BaseTenantScopedEntity {
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerEntity;

  @Column({ name: 'points_balance', type: 'int', default: 0 })
  pointsBalance!: number;

  @Column({ name: 'lifetime_points_earned', type: 'int', default: 0 })
  lifetimePointsEarned!: number;

  @Column({ name: 'lifetime_points_redeemed', type: 'int', default: 0 })
  lifetimePointsRedeemed!: number;

  @Column({ name: 'current_tier_id', type: 'uuid', nullable: true })
  currentTierId!: string | null;

  @Column({ name: 'current_tier_name', type: 'varchar', length: 80, default: 'Member' })
  currentTierName!: string;
}
