import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('event_dead_letters')
@Index(['tenantId', 'status', 'createdAt'])
@Index(['tenantId', 'subscriptionId'])
export class EventDeadLetterEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'subscription_id', type: 'uuid' })
  subscriptionId!: string;

  @Column({ name: 'event_id', type: 'varchar', length: 160 })
  eventId!: string;

  @Column({ name: 'store_record_id', type: 'uuid' })
  storeRecordId!: string;

  @Column({ type: 'varchar', length: 24, default: 'open' })
  status!: 'open' | 'replayed' | 'discarded';

  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Column({ name: 'error_message', type: 'text' })
  errorMessage!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  payload!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt!: Date | null;
}
