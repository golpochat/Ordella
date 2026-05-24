import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { NotificationStatus } from '../enums/notification-status.enum';
import { NotificationType } from '../enums/notification-type.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { NotificationChannelEntity } from './notification-channel.entity';
import { NotificationLogEntity } from './notification-log.entity';
import { NotificationTemplateEntity } from './notification-template.entity';

/** ERD §1.9 — API Spec §10.1 */
@Entity('notifications')
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'status'])
export class NotificationEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 64 })
  type!: NotificationType;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recipient!: string | null;

  @Column({ name: 'channel_id', type: 'uuid', nullable: true })
  channelId!: string | null;

  @ManyToOne(() => NotificationChannelEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'channel_id' })
  channel!: NotificationChannelEntity | null;

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId!: string | null;

  @ManyToOne(() => NotificationTemplateEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'template_id' })
  template!: NotificationTemplateEntity | null;

  @Column({ type: 'jsonb', default: {} })
  payload!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 32, default: NotificationStatus.PENDING })
  status!: NotificationStatus;

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduledAt!: Date | null;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt!: Date | null;

  @OneToMany(() => NotificationLogEntity, (log) => log.notification)
  logs!: NotificationLogEntity[];
}
