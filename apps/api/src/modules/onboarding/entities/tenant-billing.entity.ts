import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SubscriptionPlan } from '../enums/subscription-plan.enum';
import { TenantEntity } from '../../tenants/entities/tenant.entity';

@Entity('tenant_billing')
export class TenantBillingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', unique: true })
  tenantId!: string;

  @OneToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: TenantEntity;

  @Column({ type: 'varchar', length: 32, default: SubscriptionPlan.FREE })
  plan!: SubscriptionPlan;

  @Column({ name: 'billing_email', type: 'varchar', length: 255, nullable: true })
  billingEmail!: string | null;

  @Column({ name: 'payment_method', type: 'jsonb', default: {} })
  paymentMethod!: Record<string, unknown>;

  @Column({ name: 'stripe_customer_id', type: 'varchar', length: 255, nullable: true })
  stripeCustomerId!: string | null;

  @Column({ name: 'stripe_subscription_id', type: 'varchar', length: 255, nullable: true })
  stripeSubscriptionId!: string | null;

  @Column({ name: 'subscription_status', type: 'varchar', length: 32, default: 'inactive' })
  subscriptionStatus!: string;

  @Column({ name: 'trial_ends_at', type: 'timestamptz', nullable: true })
  trialEndsAt!: Date | null;

  @Column({ name: 'current_period_start', type: 'timestamptz', nullable: true })
  currentPeriodStart!: Date | null;

  @Column({ name: 'current_period_end', type: 'timestamptz', nullable: true })
  currentPeriodEnd!: Date | null;

  @Column({ name: 'orders_used_period', type: 'int', default: 0 })
  ordersUsedPeriod!: number;

  @Column({ name: 'usage_period_start', type: 'timestamptz', nullable: true })
  usagePeriodStart!: Date | null;

  @Column({ name: 'soft_limit_warned', type: 'boolean', default: false })
  softLimitWarned!: boolean;

  @Column({ name: 'hard_limit_exceeded', type: 'boolean', default: false })
  hardLimitExceeded!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
