import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantSettingsEntity } from '../../../onboarding/entities/tenant-settings.entity';
import { NotificationEntity, NotificationLogEntity, NotificationTemplateEntity } from '../../entities';
import { NotificationTemplatesController } from '../../controllers';
import { NotificationTemplatesService, NotificationsService } from '../../services';
import { NotificationTemplateRepository } from '../../repositories/notification-template.repository';
import { UserEntity } from '../../../auth/entities/user.entity';
import { NotificationChannelEntity, NotificationPreferenceEntity } from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationTemplateEntity,
      NotificationEntity,
      NotificationLogEntity,
      NotificationPreferenceEntity,
      NotificationChannelEntity,
      UserEntity,
      TenantSettingsEntity,
    ]),
  ],
  controllers: [NotificationTemplatesController],
  providers: [NotificationTemplatesService, NotificationsService, NotificationTemplateRepository],
  exports: [],
})
export class NotificationTemplatesModule {}
