import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationChannelEntity } from '../../entities';
import { NotificationChannelsController } from '../../controllers';
import { NotificationChannelsService } from '../../services';
import { NotificationChannelRepository } from '../../repositories/notification-channel.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationChannelEntity])],
  controllers: [NotificationChannelsController],
  providers: [NotificationChannelsService, NotificationChannelRepository],
  exports: [],
})
export class NotificationChannelsModule {}
