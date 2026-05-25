import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AdminModule } from '../admin/admin.module';
import { ProductEntity } from '../catalog/entities/product.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { KdsModule } from '../kds/kds.module';
import { OrdersFeatureModule } from '../orders/modules/orders/orders-feature.module';
import { PaymentsModule } from '../payments/payments.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { GiftCardsModule } from '../giftcards/giftcards.module';
import { BundlesModule } from '../bundles';
import { PosController } from './controllers';
import { PosInventoryController } from './controllers/pos-inventory.controller';
import {
  CartService,
  PosCartFacade,
  PosCatalogService,
  PosFulfillmentService,
  PosOrderService,
  PosProductStockService,
} from './services';

/**
 * POS ordering flow — in-store cart, checkout, payment, receipt, catalog.
 *
 * Routes (/api/v1, tenant-scoped):
 * - GET /pos/catalog
 * - POST /pos/cart, PATCH /pos/cart/items
 * - POST /pos/checkout, POST /pos/payment, POST /pos/complete-sale
 * - GET /pos/receipt/:orderId
 * - POST /inventory/decrement
 */
@Module({
  imports: [
    AuthModule,
    AdminModule,
    KdsModule,
    OrdersFeatureModule,
    PaymentsModule,
    InventoryModule,
    LoyaltyModule,
    GiftCardsModule,
    BundlesModule,
    TypeOrmModule.forFeature([ProductEntity]),
  ],
  controllers: [PosController, PosInventoryController],
  providers: [
    CartService,
    PosCartFacade,
    PosOrderService,
    PosCatalogService,
    PosFulfillmentService,
    PosProductStockService,
  ],
  exports: [CartService, PosOrderService, PosProductStockService],
})
export class PosModule {}
