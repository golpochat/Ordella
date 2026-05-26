import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('hardware_device_commands')
@Index(['tenantId', 'deviceId', 'status'])
export class HardwareDeviceCommandEntity {
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

  @Column({ name: 'command_type', type: 'varchar', length: 64 })
  commandType!: 'print_receipt' | 'print_label' | 'open_cash_drawer' | 'scan_barcode' | 'read_weight' | 'kiosk_refresh' | 'firmware_update' | 'ping';

  @Column({ type: 'jsonb', default: () => "'{}'" })
  payload!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 24, default: 'queued' })
  status!: 'queued' | 'sent' | 'acknowledged' | 'failed' | 'expired';

  @Column({ name: 'response_payload', type: 'jsonb', nullable: true })
  responsePayload!: Record<string, unknown> | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt!: Date | null;

  @Column({ name: 'acknowledged_at', type: 'timestamptz', nullable: true })
  acknowledgedAt!: Date | null;
}
