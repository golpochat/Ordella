import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { NotificationLogStatus } from '../enums/notification-log-status.enum';
import { NotificationChannelEntity } from './notification-channel.entity';
import { NotificationEntity } from './notification.entity';

/** SRS §22 / §48 — API Spec §10.6 delivery audit */
@Entity('notification_logs')
@Index(['notificationId', 'createdAt'])
@Index(['tenantId', 'status'])
export class NotificationLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'notification_id', type: 'uuid' })
  notificationId!: string;

  @ManyToOne(() => NotificationEntity, (notification) => notification.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notification_id' })
  notification!: NotificationEntity;

  @Column({ name: 'channel_id', type: 'uuid', nullable: true })
  channelId!: string | null;

  @ManyToOne(() => NotificationChannelEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'channel_id' })
  channel!: NotificationChannelEntity | null;

  @Column({ type: 'varchar', length: 32 })
  status!: NotificationLogStatus;

  @Column({ name: 'provider_response', type: 'jsonb', default: {} })
  providerResponse!: Record<string, unknown>;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
