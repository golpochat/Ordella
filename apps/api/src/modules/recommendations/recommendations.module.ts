import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../catalog/entities';
import { CustomerInsightEntity } from '../crm/entities';
import { InventoryCoreModule } from '../inventory/modules/inventory-core/inventory-core.module';
import { CustomerEntity } from '../loyalty/entities';
import { OrderEntity, OrderItemEntity } from '../orders/entities';
import { AuthModule } from '../auth/auth.module';
import { RecommendationsController } from './controllers';
import { RECOMMENDATION_ENTITIES } from './entities';
import { RecommendationsService } from './services';

@Module({
  imports: [
    AuthModule,
    InventoryCoreModule,
    TypeOrmModule.forFeature([
      ...RECOMMENDATION_ENTITIES,
      ProductEntity,
      OrderEntity,
      OrderItemEntity,
      CustomerEntity,
      CustomerInsightEntity,
    ]),
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
