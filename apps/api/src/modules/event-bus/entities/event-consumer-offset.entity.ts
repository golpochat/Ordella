import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('event_consumer_offsets')
@Index(['tenantId', 'subscriptionId'], { unique: true })
export class EventConsumerOffsetEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'subscription_id', type: 'uuid' })
  subscriptionId!: string;

  @Column({ name: 'last_sequence', type: 'bigint', default: '0' })
  lastSequence!: string;

  @Column({ name: 'lag_count', type: 'int', default: 0 })
  lagCount!: number;

  @Column({ name: 'processed_count', type: 'int', default: 0 })
  processedCount!: number;

  @Column({ name: 'last_processed_at', type: 'timestamptz', nullable: true })
  lastProcessedAt!: Date | null;

  @Column({ name: 'idempotency_keys', type: 'jsonb', default: () => "'[]'" })
  idempotencyKeys!: string[];

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
