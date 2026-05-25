import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProductEntity } from '../catalog/entities';
import { InventoryModule } from '../inventory/inventory.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LocationEntity } from '../tenants/entities';
import { PurchaseOrdersController, SuppliersController } from './controllers';
import { PROCUREMENT_ENTITIES } from './entities';
import { PurchaseOrdersService, SuppliersService } from './services';

@Module({
  imports: [
    AuthModule,
    InventoryModule,
    NotificationsModule,
    TypeOrmModule.forFeature([
      ...PROCUREMENT_ENTITIES,
      ProductEntity,
      LocationEntity,
    ]),
  ],
  controllers: [SuppliersController, PurchaseOrdersController],
  providers: [SuppliersService, PurchaseOrdersService],
  exports: [SuppliersService, PurchaseOrdersService],
})
export class ProcurementModule {}
