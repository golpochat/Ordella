import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type EdgeDeviceType = 'pos' | 'warehouse' | 'delivery' | 'kiosk' | 'tablet' | 'mobile';
export type EdgeDeviceStatus = 'active' | 'revoked' | 'lost' | 'sync_required';

@Entity('edge_devices')
@Index(['tenantId', 'locationId', 'deviceFingerprint'], { unique: true })
@Index(['tenantId', 'status'])
export class EdgeDeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ name: 'device_fingerprint', type: 'varchar', length: 160 })
  deviceFingerprint!: string;

  @Column({ name: 'device_type', type: 'varchar', length: 32 })
  deviceType!: EdgeDeviceType;

  @Column({ name: 'display_name', type: 'varchar', length: 160 })
  displayName!: string;

  @Column({ type: 'varchar', length: 24, default: 'active' })
  status!: EdgeDeviceStatus;

  @Column({ name: 'offline_token_hash', type: 'varchar', length: 128, nullable: true })
  offlineTokenHash!: string | null;

  @Column({ name: 'storage_key_fingerprint', type: 'varchar', length: 128, nullable: true })
  storageKeyFingerprint!: string | null;

  @Column({ name: 'last_seen_at', type: 'timestamptz', nullable: true })
  lastSeenAt!: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  capabilities!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
