import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserEntity } from '../auth/entities';
import { ProductEntity, CategoryEntity } from '../catalog/entities';
import { DeliveryTaskEntity, DriverProfileEntity } from '../deliveries/entities';
import { StockItemEntity, StockTransferEntity } from '../inventory/entities';
import { OrderEntity, OrderItemEntity } from '../orders/entities';
import { PurchaseOrderEntity, SupplierItemEntity } from '../procurement/entities';
import { LocationEntity } from '../tenants/entities';
import { NotificationsModule } from '../notifications/notifications.module';
import { WarehousePickTaskEntity } from '../warehouse/entities';
import { ForecastController } from './controllers';
import { FORECAST_ENTITIES } from './entities';
import { ForecastService } from './services';

@Module({
  imports: [
    AuthModule,
    NotificationsModule,
    TypeOrmModule.forFeature([
      ...FORECAST_ENTITIES,
      OrderEntity,
      OrderItemEntity,
      ProductEntity,
      CategoryEntity,
      StockItemEntity,
      StockTransferEntity,
      WarehousePickTaskEntity,
      PurchaseOrderEntity,
      SupplierItemEntity,
      DeliveryTaskEntity,
      DriverProfileEntity,
      UserEntity,
      LocationEntity,
    ]),
  ],
  controllers: [ForecastController],
  providers: [ForecastService],
  exports: [ForecastService],
})
export class ForecastModule {}
