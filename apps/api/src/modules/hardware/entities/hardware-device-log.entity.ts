import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('hardware_device_logs')
@Index(['tenantId', 'deviceId', 'createdAt'])
@Index(['tenantId', 'level'])
export class HardwareDeviceLogEntity {
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

  @Column({ type: 'varchar', length: 16, default: 'info' })
  level!: 'info' | 'success' | 'warning' | 'error';

  @Column({ type: 'varchar', length: 64 })
  action!: string;

  @Column({ type: 'text', nullable: true })
  message!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
