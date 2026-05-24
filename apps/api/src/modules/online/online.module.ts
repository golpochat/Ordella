import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '../catalog/entities/category.entity';
import { ProductEntity } from '../catalog/entities/product.entity';
import { ModifierEntity } from '../catalog/entities/modifier.entity';
import { ModifierOptionEntity } from '../catalog/entities/modifier-option.entity';
import { VariantEntity } from '../catalog/entities/variant.entity';
import { StockItemEntity } from '../inventory/entities/stock-item.entity';
import { OrdersFeatureModule } from '../orders/modules/orders/orders-feature.module';
import { PaymentsModule } from '../payments/payments.module';
import { InventoryModule } from '../inventory/inventory.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { DeliveriesModule } from '../deliveries/deliveries.module';
import { PublicController } from './controllers';
import {
  BasketService,
  CheckoutService,
  MenuQueryService,
  OnlineBasketFacade,
  OnlineOrderService,
} from './services';
import { MenuQueryRepository } from './repositories/menu-query.repository';

/**
 * Online retail ordering — public catalog, session basket, checkout, payment, order status.
 *
 * Routes (/api/v1, tenant via X-Tenant-Id):
 * - GET /public/menu, GET /public/menu/:categoryId
 * - POST /public/basket, PATCH /public/basket/items
 * - POST /public/checkout, POST /public/payment
 * - GET /public/order-status/:orderId
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CategoryEntity,
      ProductEntity,
      ModifierEntity,
      ModifierOptionEntity,
      VariantEntity,
      StockItemEntity,
    ]),
    OrdersFeatureModule,
    PaymentsModule,
    InventoryModule,
    PromotionsModule,
    DeliveriesModule,
  ],
  controllers: [PublicController],
  providers: [
    MenuQueryRepository,
    MenuQueryService,
    BasketService,
    OnlineBasketFacade,
    CheckoutService,
    OnlineOrderService,
  ],
  exports: [MenuQueryService, BasketService, CheckoutService, OnlineOrderService],
})
export class OnlineModule {}
