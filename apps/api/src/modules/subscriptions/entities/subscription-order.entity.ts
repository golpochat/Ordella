import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimestampsEntity } from '../../loyalty/entities/base-timestamps.entity';
import { OrderEntity } from '../../orders/entities';
import { SubscriptionEntity } from './subscription.entity';
import { SubscriptionOrderStatus } from './subscription.enums';

@Entity('customer_subscription_orders')
@Index(['subscriptionId', 'runAt'])
export class SubscriptionOrderEntity extends BaseTimestampsEntity {
  @Column({ name: 'subscription_id', type: 'uuid' })
  subscriptionId!: string;

  @ManyToOne(() => SubscriptionEntity, (subscription) => subscription.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscription_id' })
  subscription!: SubscriptionEntity;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId!: string | null;

  @ManyToOne(() => OrderEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order!: OrderEntity | null;

  @Column({ name: 'run_at', type: 'timestamptz' })
  runAt!: Date;

  @Column({ type: 'varchar', length: 16 })
  status!: SubscriptionOrderStatus;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount!: number;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason!: string | null;
}
