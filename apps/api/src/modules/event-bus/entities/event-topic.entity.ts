import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type EventTopicKey = 'orders' | 'inventory' | 'customers' | 'delivery' | 'payments' | 'iot';

@Entity('event_topics')
@Index(['tenantId', 'topicKey'], { unique: true })
export class EventTopicEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'topic_key', type: 'varchar', length: 64 })
  topicKey!: EventTopicKey;

  @Column({ name: 'display_name', type: 'varchar', length: 180 })
  displayName!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'partition_count', type: 'int', default: 8 })
  partitionCount!: number;

  @Column({ name: 'retention_days', type: 'int', default: 30 })
  retentionDays!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  permissions!: string[];

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
