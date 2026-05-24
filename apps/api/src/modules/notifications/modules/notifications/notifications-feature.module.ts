import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from '../../entities';
import { NotificationsController } from '../../controllers';
import { NotificationsService } from '../../services';
import { NotificationRepository } from '../../repositories/notification.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationRepository],
  exports: [],
})
export class NotificationsFeatureModule {}
