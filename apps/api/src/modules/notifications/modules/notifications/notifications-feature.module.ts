import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../../auth/entities/user.entity';
import {
  NotificationChannelEntity,
  NotificationEntity,
  NotificationLogEntity,
  NotificationPreferenceEntity,
  NotificationTemplateEntity,
} from '../../entities';
import { NotificationsController } from '../../controllers';
import { NotificationsService } from '../../services';
import { NotificationRepository } from '../../repositories/notification.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      NotificationLogEntity,
      NotificationPreferenceEntity,
      NotificationChannelEntity,
      NotificationTemplateEntity,
      UserEntity,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationRepository],
  exports: [NotificationsService],
})
export class NotificationsFeatureModule {}
