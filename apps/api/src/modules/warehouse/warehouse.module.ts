import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProductEntity } from '../catalog/entities';
import { StockItemEntity, StockTransferEntity, StockTransferLineEntity } from '../inventory/entities';
import { InventoryModule } from '../inventory/inventory.module';
import { StockTransfersModule } from '../inventory/modules/stock-transfers/stock-transfers.module';
import { OrderEntity, OrderItemEntity } from '../orders/entities';
import { LocationEntity } from '../tenants/entities';
import { DarkStoreController, PicksController, TransfersController, WarehouseController } from './controllers';
import { WAREHOUSE_ENTITIES } from './entities';
import { DarkStoreService, WarehouseService } from './services';
import { SearchModule } from '../search';

@Module({
  imports: [
    AuthModule,
    InventoryModule,
    StockTransfersModule,
    SearchModule,
    TypeOrmModule.forFeature([
      ...WAREHOUSE_ENTITIES,
      LocationEntity,
      ProductEntity,
      OrderEntity,
      OrderItemEntity,
      StockItemEntity,
      StockTransferEntity,
      StockTransferLineEntity,
    ]),
  ],
  controllers: [WarehouseController, TransfersController, PicksController, DarkStoreController],
  providers: [WarehouseService, DarkStoreService],
  exports: [WarehouseService],
})
export class WarehouseModule {}
