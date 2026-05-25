import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProductEntity, CategoryEntity } from '../catalog/entities';
import { CustomerEntity } from '../loyalty/entities';
import { OrderEntity } from '../orders/entities';
import { SupplierEntity } from '../procurement/entities';
import { StockItemEntity } from '../inventory/entities';
import { LocationEntity } from '../tenants/entities';
import { WarehouseBinEntity } from '../warehouse/entities';
import { SearchController } from './controllers';
import { SearchIndexEntity } from './entities';
import { SearchIndexService } from './services';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      SearchIndexEntity,
      ProductEntity,
      CategoryEntity,
      CustomerEntity,
      OrderEntity,
      SupplierEntity,
      StockItemEntity,
      LocationEntity,
      WarehouseBinEntity,
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchIndexService],
  exports: [SearchIndexService],
})
export class SearchModule {}
