import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationChannelEntity } from '../../entities/notification-channel.entity';
import { NotificationChannelsController } from '../../controllers/notification-channels.controller';
import { NotificationChannelsService } from '../../services/notification-channels.service';
import { NotificationChannelRepository } from '../../repositories/notification-channel.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationChannelEntity])],
  controllers: [NotificationChannelsController],
  providers: [NotificationChannelsService, NotificationChannelRepository],
  exports: [NotificationChannelsService, NotificationChannelRepository],
})
export class NotificationChannelsModule {}
