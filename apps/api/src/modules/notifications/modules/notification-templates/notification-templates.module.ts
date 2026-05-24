import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationTemplateEntity } from '../../entities';
import { NotificationTemplatesController } from '../../controllers';
import { NotificationTemplatesService } from '../../services';
import { NotificationTemplateRepository } from '../../repositories/notification-template.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationTemplateEntity])],
  controllers: [NotificationTemplatesController],
  providers: [NotificationTemplatesService, NotificationTemplateRepository],
  exports: [],
})
export class NotificationTemplatesModule {}
