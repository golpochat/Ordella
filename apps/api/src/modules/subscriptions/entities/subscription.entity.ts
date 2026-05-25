import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { CustomerEntity } from '../../loyalty/entities';
import { OrderType } from '../../orders/enums/order-type.enum';
import { BaseTenantScopedEntity } from '../../loyalty/entities/base-tenant-scoped.entity';
import { SubscriptionItemEntity } from './subscription-item.entity';
import { SubscriptionOrderEntity } from './subscription-order.entity';
import { SubscriptionSchedule, SubscriptionStatus } from './subscription.enums';

@Entity('customer_subscriptions')
@Index(['tenantId', 'customerId'])
@Index(['tenantId', 'status', 'nextRunAt'])
export class SubscriptionEntity extends BaseTenantScopedEntity {
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerEntity;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ name: 'order_type', type: 'varchar', length: 32, default: OrderType.PICKUP })
  orderType!: OrderType;

  @Column({ type: 'varchar', length: 32 })
  schedule!: SubscriptionSchedule;

  @Column({ name: 'next_run_at', type: 'timestamptz' })
  nextRunAt!: Date;

  @Column({ type: 'varchar', length: 32, default: SubscriptionStatus.ACTIVE })
  status!: SubscriptionStatus;

  @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2 })
  totalPrice!: string;

  @Column({ name: 'payment_method_id', type: 'varchar', length: 255, nullable: true })
  paymentMethodId!: string | null;

  @Column({ name: 'delivery_details', type: 'jsonb', nullable: true })
  deliveryDetails!: Record<string, unknown> | null;

  @OneToMany(() => SubscriptionItemEntity, (item) => item.subscription)
  items!: SubscriptionItemEntity[];

  @OneToMany(() => SubscriptionOrderEntity, (order) => order.subscription)
  orders!: SubscriptionOrderEntity[];
}
