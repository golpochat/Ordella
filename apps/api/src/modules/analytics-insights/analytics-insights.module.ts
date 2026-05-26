import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProductEntity } from '../catalog/entities';
import { CustomerInsightEntity } from '../crm/entities';
import { CustomerEntity } from '../loyalty/entities';
import { MarketingSegmentEntity } from '../marketing/entities';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrderEntity, OrderItemEntity } from '../orders/entities';
import { RecommendationEventEntity } from '../recommendations/entities';
import { AnalyticsInsightsController } from './controllers';
import { ANALYTICS_INSIGHT_ENTITIES } from './entities';
import { AnalyticsInsightsService } from './services';

@Module({
  imports: [
    AuthModule,
    NotificationsModule,
    TypeOrmModule.forFeature([
      ...ANALYTICS_INSIGHT_ENTITIES,
      ProductEntity,
      CustomerEntity,
      CustomerInsightEntity,
      OrderEntity,
      OrderItemEntity,
      MarketingSegmentEntity,
      RecommendationEventEntity,
    ]),
  ],
  controllers: [AnalyticsInsightsController],
  providers: [AnalyticsInsightsService],
  exports: [AnalyticsInsightsService],
})
export class AnalyticsInsightsModule {}
