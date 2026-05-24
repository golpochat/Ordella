import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InventoryModule } from '../inventory/inventory.module';
import { OrdersFeatureModule } from '../orders/modules/orders/orders-feature.module';
import { PaymentsModule } from '../payments/payments.module';
import { PosController } from './controllers';
import { CartService, PosCartFacade, PosOrderService } from './services';

/**
 * POS ordering flow — in-store cart, checkout, payment, receipt.
 *
 * Routes (/api/v1, tenant-scoped):
 * - POST /pos/cart
 * - PATCH /pos/cart/items
 * - POST /pos/checkout
 * - POST /pos/payment
 * - GET /pos/receipt/:orderId
 */
@Module({
  imports: [AuthModule, OrdersFeatureModule, PaymentsModule, InventoryModule],
  controllers: [PosController],
  providers: [CartService, PosCartFacade, PosOrderService],
  exports: [CartService, PosOrderService],
})
export class PosModule {}
