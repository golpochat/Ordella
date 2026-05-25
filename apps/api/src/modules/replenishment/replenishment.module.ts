import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProductEntity } from '../catalog/entities';
import { ForecastModule } from '../forecast';
import { StockItemEntity } from '../inventory/entities';
import { StockTransfersModule } from '../inventory/modules/stock-transfers/stock-transfers.module';
import { ProcurementModule } from '../procurement/procurement.module';
import { SupplierEntity, SupplierItemEntity } from '../procurement/entities';
import { LocationEntity } from '../tenants/entities';
import { WarehouseModule } from '../warehouse';
import { ReplenishmentController } from './controllers';
import { REPLENISHMENT_ENTITIES } from './entities';
import { ReplenishmentService } from './services';

@Module({
  imports: [
    AuthModule,
    ForecastModule,
    ProcurementModule,
    StockTransfersModule,
    WarehouseModule,
    TypeOrmModule.forFeature([
      ...REPLENISHMENT_ENTITIES,
      StockItemEntity,
      ProductEntity,
      LocationEntity,
      SupplierEntity,
      SupplierItemEntity,
    ]),
  ],
  controllers: [ReplenishmentController],
  providers: [ReplenishmentService],
  exports: [ReplenishmentService],
})
export class ReplenishmentModule {}
