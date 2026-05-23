import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { SessionStatus } from '../enums/session-status.enum';
import { BaseTenantEntity } from './base-tenant.entity';
import { UserEntity } from './user.entity';
import { UserDeviceEntity } from './user-device.entity';

/**
 * User sessions — SRS session management, refresh tokens, device binding.
 */
@Entity('sessions')
@Index(['userId', 'status'])
export class SessionEntity extends BaseTenantEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'device_id', type: 'uuid', nullable: true })
  deviceId!: string | null;

  @ManyToOne(() => UserDeviceEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'device_id' })
  device!: UserDeviceEntity | null;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 255 })
  refreshTokenHash!: string;

  @Column({ type: 'varchar', length: 32, default: SessionStatus.ACTIVE })
  status!: SessionStatus;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string | null;

  @Column({ name: 'last_active_at', type: 'timestamptz', nullable: true })
  lastActiveAt!: Date | null;
}
