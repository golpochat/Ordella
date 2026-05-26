import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('offline_sync_logs')
@Index(['tenantId', 'locationId', 'createdAt'])
@Index(['tenantId', 'eventType'])
export class OfflineSyncLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId!: string | null;

  @Column({ name: 'device_id', type: 'uuid', nullable: true })
  deviceId!: string | null;

  @Column({ name: 'event_type', type: 'varchar', length: 64 })
  eventType!: 'offline_action' | 'sync_attempt' | 'sync_success' | 'sync_failure' | 'conflict_created' | 'conflict_resolved' | 'force_sync' | 'device_bound';

  @Column({ type: 'varchar', length: 16, default: 'info' })
  level!: 'info' | 'warn' | 'error';

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
