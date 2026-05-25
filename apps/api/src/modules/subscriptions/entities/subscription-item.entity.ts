import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimestampsEntity } from '../../loyalty/entities/base-timestamps.entity';
import { SubscriptionEntity } from './subscription.entity';

@Entity('customer_subscription_items')
@Index(['subscriptionId'])
export class SubscriptionItemEntity extends BaseTimestampsEntity {
  @Column({ name: 'subscription_id', type: 'uuid' })
  subscriptionId!: string;

  @ManyToOne(() => SubscriptionEntity, (subscription) => subscription.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscription_id' })
  subscription!: SubscriptionEntity;

  @Column({ name: 'item_id', type: 'uuid' })
  itemId!: string;

  @Column({ name: 'variant_id', type: 'uuid', nullable: true })
  variantId!: string | null;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'jsonb', default: {} })
  modifiers!: Record<string, unknown>;
}
