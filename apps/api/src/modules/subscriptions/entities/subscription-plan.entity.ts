import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseTenantScopedEntity } from '../../loyalty/entities/base-tenant-scoped.entity';
import { SubscriptionBillingCycle, SubscriptionPlanStatus } from './subscription.enums';
import { SubscriptionEntity } from './subscription.entity';

@Entity('subscription_plans')
@Index(['tenantId', 'status'])
export class SubscriptionPlanEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: string;

  @Column({ name: 'billing_cycle', type: 'varchar', length: 16 })
  billingCycle!: SubscriptionBillingCycle;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  perks!: {
    freeDelivery?: boolean;
    discountPercent?: number;
    pointsMultiplier?: number;
    exclusiveItems?: string[];
    description?: string[];
  };

  @Column({ name: 'trial_period_days', type: 'int', default: 0 })
  trialPeriod!: number;

  @Column({ type: 'varchar', length: 16, default: SubscriptionPlanStatus.ACTIVE })
  status!: SubscriptionPlanStatus;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @OneToMany(() => SubscriptionEntity, (subscription) => subscription.plan)
  subscriptions!: SubscriptionEntity[];
}
