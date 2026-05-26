import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('offline_sync_cursors')
@Index(['tenantId', 'locationId', 'deviceId'], { unique: true })
export class OfflineSyncCursorEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ name: 'device_id', type: 'uuid' })
  deviceId!: string;

  @Column({ name: 'last_cursor', type: 'varchar', length: 80, default: '0' })
  lastCursor!: string;

  @Column({ name: 'last_pull_at', type: 'timestamptz', nullable: true })
  lastPullAt!: Date | null;

  @Column({ name: 'last_push_at', type: 'timestamptz', nullable: true })
  lastPushAt!: Date | null;
}
