import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { DeviceType } from '../enums/device-type.enum';
import { BaseTenantEntity } from './base-tenant.entity';
import { UserEntity } from './user.entity';

/** Device registration — SRS device binding, terminal auth. */
@Entity('user_devices')
@Index(['tenantId', 'userId', 'deviceFingerprint'], { unique: true })
export class UserDeviceEntity extends BaseTenantEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'device_fingerprint', type: 'varchar', length: 255 })
  deviceFingerprint!: string;

  @Column({ type: 'varchar', length: 32 })
  type!: DeviceType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  label!: string | null;

  @Column({ name: 'terminal_id', type: 'uuid', nullable: true })
  terminalId!: string | null;

  @Column({ name: 'last_seen_at', type: 'timestamptz', nullable: true })
  lastSeenAt!: Date | null;
}
