import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('offline_location_settings')
@Index(['tenantId', 'locationId'], { unique: true })
export class OfflineLocationSettingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ name: 'offline_mode_enabled', type: 'boolean', default: true })
  offlineModeEnabled!: boolean;

  @Column({ name: 'allow_pos_sales', type: 'boolean', default: true })
  allowPosSales!: boolean;

  @Column({ name: 'allow_warehouse_ops', type: 'boolean', default: true })
  allowWarehouseOps!: boolean;

  @Column({ name: 'allow_delivery_ops', type: 'boolean', default: true })
  allowDeliveryOps!: boolean;

  @Column({ name: 'allow_kiosk_orders', type: 'boolean', default: true })
  allowKioskOrders!: boolean;

  @Column({ name: 'require_device_binding', type: 'boolean', default: true })
  requireDeviceBinding!: boolean;

  @Column({ name: 'max_offline_minutes', type: 'int', default: 720 })
  maxOfflineMinutes!: number;

  @Column({ name: 'delta_retention_days', type: 'int', default: 14 })
  deltaRetentionDays!: number;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  policy!: Record<string, unknown>;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
