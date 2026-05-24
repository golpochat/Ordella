import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ORDERS_ENTITIES } from './entities';
import { OrdersFeatureModule } from './modules/orders/orders-feature.module';
import { OrderItemsModule } from './modules/order-items/order-items.module';

/**
 * Orders domain — SRS order lifecycle, API Spec §5 (architecture blueprint §2.2 Orders Service).
 *
 * Routes (/api/v1, tenant-scoped):
 * - /orders, /order-items
 * - /orders/:id/status-history, /orders/:id/events
 */
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature(ORDERS_ENTITIES),
    OrdersFeatureModule,
    OrderItemsModule,
  ],
  exports: [OrdersFeatureModule, OrderItemsModule, TypeOrmModule],
})
export class OrdersModule {}
