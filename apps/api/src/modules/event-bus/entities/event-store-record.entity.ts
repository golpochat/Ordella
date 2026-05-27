import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type EventProducer =
  | 'pos'
  | 'storefront'
  | 'warehouse'
  | 'delivery_app'
  | 'iot_device'
  | 'api'
  | 'system';

@Entity('event_store_records')
@Index(['tenantId', 'topicKey', 'sequenceNumber'])
@Index(['tenantId', 'eventId'], { unique: true })
@Index(['tenantId', 'topicKey', 'partitionKey', 'sequenceNumber'])
export class EventStoreRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'event_id', type: 'varchar', length: 160 })
  eventId!: string;

  @Column({ name: 'topic_key', type: 'varchar', length: 64 })
  topicKey!: string;

  @Column({ name: 'partition_key', type: 'varchar', length: 128 })
  partitionKey!: string;

  @Column({ name: 'sequence_number', type: 'bigint' })
  sequenceNumber!: string;

  @Column({ name: 'event_type', type: 'varchar', length: 128 })
  eventType!: string;

  @Column({ name: 'schema_version', type: 'int', default: 1 })
  schemaVersion!: number;

  @Column({ type: 'varchar', length: 32 })
  producer!: EventProducer;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  payload!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId!: string | null;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: Date;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
