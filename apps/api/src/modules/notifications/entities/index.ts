import { NotificationChannelEntity } from './notification-channel.entity';
import { NotificationLogEntity } from './notification-log.entity';
import { NotificationTemplateEntity } from './notification-template.entity';
import { NotificationEntity } from './notification.entity';

export { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
export { BaseTimestampsEntity } from './base-timestamps.entity';
export { NotificationChannelEntity } from './notification-channel.entity';
export { NotificationLogEntity } from './notification-log.entity';
export { NotificationTemplateEntity } from './notification-template.entity';
export { NotificationEntity } from './notification.entity';

export const NOTIFICATIONS_ENTITIES = [
  NotificationChannelEntity,
  NotificationLogEntity,
  NotificationTemplateEntity,
  NotificationEntity,
];
