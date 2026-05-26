import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity, NotificationLogEntity } from '../../entities';
import { NotificationLogsController } from '../../controllers';
import { NotificationLogsService } from '../../services';
import { NotificationLogRepository } from '../../repositories/notification-log.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationLogEntity, NotificationEntity])],
  controllers: [NotificationLogsController],
  providers: [NotificationLogsService, NotificationLogRepository],
  exports: [],
})
export class NotificationLogsModule {}
