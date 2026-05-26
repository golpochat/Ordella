import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type HardwareDeviceType =
  | 'receipt_printer'
  | 'label_printer'
  | 'barcode_scanner'
  | 'scale'
  | 'cash_drawer'
  | 'kiosk'
  | 'kds_screen'
  | 'temperature_sensor'
  | 'humidity_sensor'
  | 'door_sensor'
  | 'shelf_weight_sensor';

export type HardwareDeviceStatus = 'online' | 'offline' | 'error';

@Entity('hardware_devices')
@Index(['tenantId', 'deviceId'], { unique: true })
@Index(['tenantId', 'locationId', 'status'])
export class HardwareDeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'device_id', type: 'varchar', length: 128 })
  deviceId!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ name: 'device_type', type: 'varchar', length: 48 })
  deviceType!: HardwareDeviceType;

  @Column({ name: 'display_name', type: 'varchar', length: 160 })
  displayName!: string;

  @Column({ type: 'varchar', length: 24, default: 'offline' })
  status!: HardwareDeviceStatus;

  @Column({ name: 'last_heartbeat_at', type: 'timestamptz', nullable: true })
  lastHeartbeatAt!: Date | null;

  @Column({ name: 'firmware_version', type: 'varchar', length: 64, nullable: true })
  firmwareVersion!: string | null;

  @Column({ name: 'auth_token_hash', type: 'varchar', length: 128, nullable: true })
  authTokenHash!: string | null;

  @Column({ name: 'supports_encryption', type: 'boolean', default: false })
  supportsEncryption!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  config!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  capabilities!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
