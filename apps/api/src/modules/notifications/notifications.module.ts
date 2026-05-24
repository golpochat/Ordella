import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { NOTIFICATIONS_ENTITIES } from './entities';
import { NotificationsFeatureModule } from './modules/notifications/notifications-feature.module';
import { NotificationTemplatesModule } from './modules/notification-templates/notification-templates.module';
import { NotificationChannelsModule } from './modules/notification-channels/notification-channels.module';
import { NotificationLogsModule } from './modules/notification-logs/notification-logs.module';

/**
 * Notifications domain — SRS §22 / §48, API Spec §10 (blueprint Notifications Service).
 *
 * Routes (/api/v1, tenant-scoped):
 * - /notifications, /notifications/logs
 * - /notification-templates, /notification-channels
 */
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature(NOTIFICATIONS_ENTITIES),
    NotificationChannelsModule,
    NotificationTemplatesModule,
    NotificationsFeatureModule,
    NotificationLogsModule,
  ],
  exports: [],
})
export class NotificationsModule {}
