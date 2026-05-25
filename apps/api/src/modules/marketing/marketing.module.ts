import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CustomerEntity } from '../loyalty/entities';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrderEntity, OrderItemEntity } from '../orders/entities';
import { MarketingCampaignsController, MarketingSegmentsController } from './controllers';
import { MARKETING_ENTITIES } from './entities';
import { MarketingCampaignsService, MarketingSchedulerService, MarketingSegmentsService } from './services';

@Module({
  imports: [
    AuthModule,
    NotificationsModule,
    TypeOrmModule.forFeature([
      ...MARKETING_ENTITIES,
      CustomerEntity,
      OrderEntity,
      OrderItemEntity,
    ]),
  ],
  controllers: [MarketingCampaignsController, MarketingSegmentsController],
  providers: [MarketingCampaignsService, MarketingSchedulerService, MarketingSegmentsService],
  exports: [MarketingCampaignsService, MarketingSegmentsService],
})
export class MarketingModule {}
