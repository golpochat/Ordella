import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CustomerEntity } from '../../loyalty/entities';
import { OrderType } from '../../orders/enums/order-type.enum';
import { BaseTenantScopedEntity } from '../../loyalty/entities/base-tenant-scoped.entity';
import { SubscriptionBillingCycle, SubscriptionSchedule, SubscriptionStatus } from './subscription.enums';
import { SubscriptionPlanEntity } from './subscription-plan.entity';

type SubscriptionItemSnapshot = {
  id: string;
  itemId: string;
  variantId: string | null;
  quantity: number;
  modifiers: Record<string, unknown>;
};

type SubscriptionOrderSnapshot = {
  id: string;
  orderId: string | null;
  runAt: Date;
  status: string;
  failureReason: string | null;
};

@Entity('customer_subscriptions')
@Index(['tenantId', 'customerId'])
@Index(['tenantId', 'status', 'nextRunAt'])
export class SubscriptionEntity extends BaseTenantScopedEntity {
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerEntity;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId!: string | null;

  @Column({ name: 'plan_id', type: 'uuid', nullable: true })
  planId!: string | null;

  @ManyToOne(() => SubscriptionPlanEntity, (plan) => plan.subscriptions, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'plan_id' })
  plan!: SubscriptionPlanEntity | null;

  @Column({ name: 'order_type', type: 'varchar', length: 32, default: OrderType.PICKUP })
  orderType!: OrderType;

  @Column({ type: 'varchar', length: 32, nullable: true })
  schedule!: SubscriptionSchedule | null;

  @Column({ name: 'billing_cycle', type: 'varchar', length: 16, nullable: true })
  billingCycle!: SubscriptionBillingCycle | null;

  @Column({ name: 'start_date', type: 'timestamptz', nullable: true })
  startDate!: Date | null;

  @Column({ name: 'renewal_date', type: 'timestamptz', nullable: true })
  renewalDate!: Date | null;

  @Column({ name: 'next_run_at', type: 'timestamptz' })
  nextRunAt!: Date;

  @Column({ type: 'varchar', length: 32, default: SubscriptionStatus.ACTIVE })
  status!: SubscriptionStatus;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2 })
  totalPrice!: string;

  @Column({ name: 'payment_method_id', type: 'varchar', length: 255, nullable: true })
  paymentMethodId!: string | null;

  @Column({ name: 'canceled_at', type: 'timestamptz', nullable: true })
  canceledAt!: Date | null;

  @Column({ name: 'cancel_at_period_end', type: 'boolean', default: false })
  cancelAtPeriodEnd!: boolean;

  @Column({ name: 'failed_payment_attempts', type: 'int', default: 0 })
  failedPaymentAttempts!: number;

  @Column({ name: 'last_payment_failed_at', type: 'timestamptz', nullable: true })
  lastPaymentFailedAt!: Date | null;

  @Column({ name: 'refund_policy', type: 'jsonb', default: () => "'{}'" })
  refundPolicy!: Record<string, unknown>;

  @Column({ name: 'delivery_details', type: 'jsonb', nullable: true })
  deliveryDetails!: Record<string, unknown> | null;

  @OneToMany('SubscriptionItemEntity', 'subscription')
  items!: SubscriptionItemSnapshot[];

  @OneToMany('SubscriptionOrderEntity', 'subscription')
  orders!: SubscriptionOrderSnapshot[];
}
