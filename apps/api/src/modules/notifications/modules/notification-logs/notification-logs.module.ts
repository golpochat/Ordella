import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity, NotificationLogEntity } from '../../entities';
import { NotificationLogsService } from '../../services';
import { NotificationLogRepository } from '../../repositories/notification-log.repository';

/** Logs are served from NotificationsController @Get('logs') to avoid :id route shadowing. */
@Module({
  imports: [TypeOrmModule.forFeature([NotificationLogEntity, NotificationEntity])],
  providers: [NotificationLogsService, NotificationLogRepository],
  exports: [NotificationLogsService],
})
export class NotificationLogsModule {}
