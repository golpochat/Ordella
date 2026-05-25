import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { UserEntity } from '../auth/entities';
import { CategoryEntity, ProductEntity } from '../catalog/entities';
import { StockItemEntity, StockTransferEntity } from '../inventory/entities';
import { CustomerEntity } from '../loyalty/entities';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { OrderEntity, OrderItemEntity } from '../orders/entities';
import { PurchaseOrderEntity, SupplierEntity } from '../procurement/entities';
import { WarehouseBinEntity, WarehousePickTaskEntity } from '../warehouse/entities';
import { FranchiseGroupEntity, LocationEntity, TenantEntity } from '../tenants/entities';
import { HqController } from './controllers';
import { HqService } from './services';

@Module({
  imports: [
    AuthModule,
    AuditModule,
    OnboardingModule,
    TypeOrmModule.forFeature([
      TenantEntity,
      FranchiseGroupEntity,
      LocationEntity,
      OrderEntity,
      OrderItemEntity,
      CustomerEntity,
      StockItemEntity,
      UserEntity,
      ProductEntity,
      CategoryEntity,
      SupplierEntity,
      PurchaseOrderEntity,
      StockTransferEntity,
      WarehousePickTaskEntity,
      WarehouseBinEntity,
    ]),
  ],
  controllers: [HqController],
  providers: [HqService],
  exports: [HqService],
})
export class HqModule {}
