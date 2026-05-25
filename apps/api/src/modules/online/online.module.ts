import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingModule } from '../billing/billing.module';
import { LocationsFeatureModule } from '../tenants/modules/locations/locations.module';
import { AdminModule } from '../admin/admin.module';
import { LocationEntity } from '../tenants/entities/location.entity';
import { CategoryEntity } from '../catalog/entities/category.entity';
import { ProductEntity } from '../catalog/entities/product.entity';
import { ModifierEntity } from '../catalog/entities/modifier.entity';
import { ModifierOptionEntity } from '../catalog/entities/modifier-option.entity';
import { VariantEntity } from '../catalog/entities/variant.entity';
import { ProductModifierEntity } from '../catalog/entities/product-modifier.entity';
import { StockItemEntity } from '../inventory/entities/stock-item.entity';
import { KdsModule } from '../kds/kds.module';
import { PosModule } from '../pos/pos.module';
import { OrdersFeatureModule } from '../orders/modules/orders/orders-feature.module';
import { PaymentsModule } from '../payments/payments.module';
import { InventoryModule } from '../inventory/inventory.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { DeliveriesModule } from '../deliveries/deliveries.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { GiftCardsModule } from '../giftcards/giftcards.module';
import { PublicController } from './controllers';
import { PublicCatalogController } from './controllers/public-catalog.controller';
import { OrdersOnlinePublicController } from './controllers/orders-online-public.controller';
import { PaymentsCheckoutController } from './controllers/payments-checkout.controller';
import { PaymentsStripeWebhookController } from './controllers/payments-stripe-webhook.controller';
import { PublicLocationsController } from './controllers/public-locations.controller';
import {
  BasketService,
  CheckoutService,
  MenuQueryService,
  OnlineBasketFacade,
  OnlineCatalogService,
  OnlineOrderService,
  OnlineStripeCheckoutService,
  StripeCheckoutPendingStore,
} from './services';
import { MenuQueryRepository } from './repositories/menu-query.repository';

/**
 * Online retail ordering — public catalog, session basket, checkout, payment, order status.
 *
 * Routes (/api/v1, tenant via X-Tenant-Id):
 * - GET /catalog, GET /catalog/categories, GET /catalog/items
 * - GET /public/menu, GET /public/menu/:categoryId
 * - POST /public/basket, PATCH /public/basket/items
 * - POST /public/checkout, POST /public/payment
 * - POST /orders/create-online
 * - GET /public/order-status/:orderId
 */
@Module({
  imports: [
    BillingModule,
    LocationsFeatureModule,
    AdminModule,
    KdsModule,
    PosModule,
    TypeOrmModule.forFeature([
      LocationEntity,
      CategoryEntity,
      ProductEntity,
      ModifierEntity,
      ModifierOptionEntity,
      VariantEntity,
      ProductModifierEntity,
      StockItemEntity,
    ]),
    OrdersFeatureModule,
    PaymentsModule,
    InventoryModule,
    PromotionsModule,
    DeliveriesModule,
    LoyaltyModule,
    GiftCardsModule,
  ],
  controllers: [
    PublicController,
    PublicCatalogController,
    OrdersOnlinePublicController,
    PaymentsCheckoutController,
    PaymentsStripeWebhookController,
    PublicLocationsController,
  ],
  providers: [
    MenuQueryRepository,
    MenuQueryService,
    OnlineCatalogService,
    BasketService,
    OnlineBasketFacade,
    CheckoutService,
    OnlineOrderService,
    StripeCheckoutPendingStore,
    OnlineStripeCheckoutService,
  ],
  exports: [MenuQueryService, BasketService, CheckoutService, OnlineOrderService],
})
export class OnlineModule {}
