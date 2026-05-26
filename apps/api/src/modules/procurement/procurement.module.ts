import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProductEntity } from '../catalog/entities';
import { InventoryModule } from '../inventory/inventory.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LocationEntity } from '../tenants/entities';
import { PurchaseOrdersController, SupplierPortalController, SuppliersController } from './controllers';
import { PROCUREMENT_ENTITIES } from './entities';
import { PurchaseOrdersService, SupplierPortalService, SuppliersService } from './services';
import { SearchModule } from '../search';
import { SupplierAuthGuard } from './guards/supplier-auth.guard';
import { TaxModule } from '../tax';

@Module({
  imports: [
    AuthModule,
    InventoryModule,
    NotificationsModule,
    SearchModule,
    TaxModule,
    TypeOrmModule.forFeature([
      ...PROCUREMENT_ENTITIES,
      ProductEntity,
      LocationEntity,
    ]),
  ],
  controllers: [SuppliersController, PurchaseOrdersController, SupplierPortalController],
  providers: [SuppliersService, PurchaseOrdersService, SupplierPortalService, SupplierAuthGuard],
  exports: [SuppliersService, PurchaseOrdersService, SupplierPortalService],
})
export class ProcurementModule {}
