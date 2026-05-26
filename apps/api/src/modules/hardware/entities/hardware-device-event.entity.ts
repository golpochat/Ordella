import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('hardware_device_events')
@Index(['tenantId', 'deviceId', 'eventType'])
@Index(['tenantId', 'locationId', 'createdAt'])
export class HardwareDeviceEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ name: 'device_pk', type: 'uuid' })
  devicePk!: string;

  @Column({ name: 'device_id', type: 'varchar', length: 128 })
  deviceId!: string;

  @Column({ name: 'event_type', type: 'varchar', length: 64 })
  eventType!: 'heartbeat' | 'barcode_scanned' | 'weight_reading' | 'temperature_alert' | 'humidity_alert' | 'door_open' | 'shelf_weight_changed' | 'kiosk_event' | 'printer_status' | 'error';

  @Column({ type: 'jsonb', default: () => "'{}'" })
  payload!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 24, default: 'received' })
  status!: 'received' | 'processed' | 'failed';

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
