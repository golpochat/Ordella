import { Column, Entity, Index } from 'typeorm';
import { NotificationChannelType } from '../enums/notification-channel-type.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';

/** SRS §22 — multi-channel delivery configuration */
@Entity('notification_channels')
@Index(['tenantId', 'channelType'])
export class NotificationChannelEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ name: 'channel_type', type: 'varchar', length: 32 })
  channelType!: NotificationChannelType;

  @Column({ type: 'jsonb', default: {} })
  config!: Record<string, unknown>;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled!: boolean;
}
