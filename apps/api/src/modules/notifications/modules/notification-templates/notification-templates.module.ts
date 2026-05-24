import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationTemplateEntity } from '../../entities/notification-template.entity';
import { NotificationTemplatesController } from '../../controllers/notification-templates.controller';
import { NotificationTemplatesService } from '../../services/notification-templates.service';
import { NotificationTemplateRepository } from '../../repositories/notification-template.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationTemplateEntity])],
  controllers: [NotificationTemplatesController],
  providers: [NotificationTemplatesService, NotificationTemplateRepository],
  exports: [],
})
export class NotificationTemplatesModule {}
