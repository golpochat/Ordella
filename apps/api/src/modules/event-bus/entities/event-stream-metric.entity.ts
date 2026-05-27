import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('event_stream_metrics')
@Index(['tenantId', 'topicKey', 'windowStart'])
export class EventStreamMetricEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'topic_key', type: 'varchar', length: 64 })
  topicKey!: string;

  @Column({ name: 'window_start', type: 'timestamptz' })
  windowStart!: Date;

  @Column({ name: 'window_end', type: 'timestamptz' })
  windowEnd!: Date;

  @Column({ name: 'event_count', type: 'int', default: 0 })
  eventCount!: number;

  @Column({ name: 'bytes_estimate', type: 'int', default: 0 })
  bytesEstimate!: number;

  @Column({ name: 'anomaly_score', type: 'decimal', precision: 6, scale: 4, nullable: true })
  anomalyScore!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  aggregates!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
