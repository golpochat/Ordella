import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProductEntity } from '../catalog/entities';
import { StockItemEntity, StockTransferEntity, StockTransferLineEntity } from '../inventory/entities';
import { StockTransfersModule } from '../inventory/modules/stock-transfers/stock-transfers.module';
import { LocationEntity } from '../tenants/entities';
import { PicksController, TransfersController, WarehouseController } from './controllers';
import { WAREHOUSE_ENTITIES } from './entities';
import { WarehouseService } from './services';
import { SearchModule } from '../search';

@Module({
  imports: [
    AuthModule,
    StockTransfersModule,
    SearchModule,
    TypeOrmModule.forFeature([
      ...WAREHOUSE_ENTITIES,
      LocationEntity,
      ProductEntity,
      StockItemEntity,
      StockTransferEntity,
      StockTransferLineEntity,
    ]),
  ],
  controllers: [WarehouseController, TransfersController, PicksController],
  providers: [WarehouseService],
  exports: [WarehouseService],
})
export class WarehouseModule {}
