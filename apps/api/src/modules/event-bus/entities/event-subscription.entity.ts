import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type EventConsumerType =
  | 'analytics'
  | 'ai_assistant'
  | 'notifications'
  | 'integrations'
  | 'marketing'
  | 'inventory'
  | 'delivery';

@Entity('event_subscriptions')
@Index(['tenantId', 'topicKey', 'consumerGroup'], { unique: true })
export class EventSubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'topic_key', type: 'varchar', length: 64 })
  topicKey!: string;

  @Column({ name: 'consumer_group', type: 'varchar', length: 128 })
  consumerGroup!: string;

  @Column({ name: 'consumer_type', type: 'varchar', length: 64 })
  consumerType!: EventConsumerType;

  @Column({ name: 'filter_rules', type: 'jsonb', default: () => "'{}'" })
  filterRules!: Record<string, unknown>;

  @Column({ name: 'delivery_semantics', type: 'varchar', length: 32, default: 'at_least_once' })
  deliverySemantics!: 'at_least_once' | 'exactly_once';

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'max_retries', type: 'int', default: 5 })
  maxRetries!: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
