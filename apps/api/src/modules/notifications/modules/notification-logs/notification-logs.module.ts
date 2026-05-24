import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLogEntity } from '../../entities/notification-log.entity';
import { NotificationLogsController } from '../../controllers/notification-logs.controller';
import { NotificationLogsService } from '../../services/notification-logs.service';
import { NotificationLogRepository } from '../../repositories/notification-log.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationLogEntity])],
  controllers: [NotificationLogsController],
  providers: [NotificationLogsService, NotificationLogRepository],
  exports: [],
})
export class NotificationLogsModule {}
