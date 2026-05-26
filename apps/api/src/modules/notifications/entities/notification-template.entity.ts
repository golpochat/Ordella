import { Column, Entity, Index } from 'typeorm';
import { NotificationChannelType } from '../enums/notification-channel-type.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';

/** ERD §1.9 — API Spec §10.2 */
@Entity('notification_templates')
@Index(['tenantId', 'name', 'channel'], { unique: true })
export class NotificationTemplateEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'varchar', length: 32 })
  channel!: NotificationChannelType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject!: string | null;

  @Column({ type: 'jsonb', default: {} })
  content!: Record<string, unknown>;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
