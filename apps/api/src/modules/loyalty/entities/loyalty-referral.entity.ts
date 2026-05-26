import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { CustomerEntity } from './customer.entity';

export type LoyaltyReferralStatus = 'pending' | 'converted' | 'rewarded' | 'flagged';

@Entity('loyalty_referrals')
@Index(['tenantId', 'code'], { unique: true })
@Index(['tenantId', 'referrerCustomerId'])
export class LoyaltyReferralEntity extends BaseTenantScopedEntity {
  @Column({ name: 'referrer_customer_id', type: 'uuid' })
  referrerCustomerId!: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'referrer_customer_id' })
  referrer!: CustomerEntity;

  @Column({ name: 'referred_customer_id', type: 'uuid', nullable: true })
  referredCustomerId!: string | null;

  @ManyToOne(() => CustomerEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'referred_customer_id' })
  referredCustomer!: CustomerEntity | null;

  @Column({ type: 'varchar', length: 24 })
  code!: string;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: LoyaltyReferralStatus;

  @Column({ name: 'referrer_bonus_points', type: 'int', default: 0 })
  referrerBonusPoints!: number;

  @Column({ name: 'referee_bonus_points', type: 'int', default: 0 })
  refereeBonusPoints!: number;

  @Column({ name: 'converted_at', type: 'timestamptz', nullable: true })
  convertedAt!: Date | null;

  @Column({ name: 'rewarded_at', type: 'timestamptz', nullable: true })
  rewardedAt!: Date | null;

  @Column({ name: 'fraud_reason', type: 'varchar', length: 255, nullable: true })
  fraudReason!: string | null;
}
