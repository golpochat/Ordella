import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProductEntity } from '../catalog/entities/product.entity';
import { CategoryEntity } from '../catalog/entities/category.entity';
import { ModifierEntity } from '../catalog/entities/modifier.entity';
import { ModifierOptionEntity } from '../catalog/entities/modifier-option.entity';
import { ProductModifierEntity } from '../catalog/entities/product-modifier.entity';
import { VariantEntity } from '../catalog/entities/variant.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { StockItemEntity } from '../inventory/entities/stock-item.entity';
import { StockMovementEntity } from '../inventory/entities/stock-movement.entity';
import { PromotionEntity } from '../promotions/entities/promotion.entity';
import { PromotionApplicationEntity } from '../promotions/entities/promotion-application.entity';
import { TenantEntity } from '../tenants/entities/tenant.entity';
import { LocationEntity } from '../tenants/entities/location.entity';
import { LocationSettingsEntity } from '../tenants/entities/location-settings.entity';
import { LocationOpeningHoursEntity } from '../tenants/entities/location-opening-hours.entity';
import { OrdersFeatureModule } from '../orders/modules/orders/orders-feature.module';
import { InventoryModule } from '../inventory/inventory.module';
import { ReportsModule } from '../reports/reports.module';
import {
  AdminInventoryController,
  AdminOrdersController,
  AdminProductsController,
  AdminPromotionsController,
  AdminReportsController,
  AdminSettingsController,
  CatalogBuilderController,
} from './controllers';
import {
  InventoryAdminService,
  OrdersAdminService,
  ProductAdminService,
  PromotionsAdminService,
  ReportsAdminService,
  TenantSettingsService,
  CatalogBuilderService,
} from './services';
import { CatalogBuilderRepository } from './repositories/catalog-builder.repository';
import { AdminProductRepository } from './repositories/admin-product.repository';
import { AdminCatalogRepository } from './repositories/admin-catalog.repository';
import { AdminOrderQueryRepository } from './repositories/admin-order-query.repository';
import { AdminPromotionRepository } from './repositories/admin-promotion.repository';
import { AdminInventoryRepository } from './repositories/admin-inventory.repository';
import { AdminSettingsRepository } from './repositories/admin-settings.repository';
import { AdminNotificationsIntegration } from './integrations/admin-notifications.integration';

/**
 * Admin Dashboard API — tenant-scoped management layer over core domains.
 *
 * Routes (/api/v1):
 * - /admin/products, /admin/inventory, /admin/orders
 * - /admin/promotions, /admin/reports, /admin/settings
 */
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      ProductEntity,
      CategoryEntity,
      ModifierEntity,
      ModifierOptionEntity,
      ProductModifierEntity,
      VariantEntity,
      OrderEntity,
      StockItemEntity,
      StockMovementEntity,
      PromotionEntity,
      PromotionApplicationEntity,
      TenantEntity,
      LocationEntity,
      LocationSettingsEntity,
      LocationOpeningHoursEntity,
    ]),
    OrdersFeatureModule,
    InventoryModule,
    ReportsModule,
  ],
  controllers: [
    AdminProductsController,
    CatalogBuilderController,
    AdminInventoryController,
    AdminOrdersController,
    AdminPromotionsController,
    AdminReportsController,
    AdminSettingsController,
  ],
  providers: [
    AdminProductRepository,
    AdminCatalogRepository,
    CatalogBuilderRepository,
    AdminOrderQueryRepository,
    AdminPromotionRepository,
    AdminInventoryRepository,
    AdminSettingsRepository,
    ProductAdminService,
    CatalogBuilderService,
    InventoryAdminService,
    OrdersAdminService,
    PromotionsAdminService,
    ReportsAdminService,
    TenantSettingsService,
    AdminNotificationsIntegration,
  ],
  exports: [
    ProductAdminService,
    CatalogBuilderService,
    InventoryAdminService,
    OrdersAdminService,
    PromotionsAdminService,
    ReportsAdminService,
    TenantSettingsService,
  ],
})
export class AdminModule {}
