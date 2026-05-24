import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../../catalog/entities/product.entity';
import { VariantEntity } from '../../../catalog/entities/variant.entity';
import { OrderEntity } from '../../entities';
import { OrderStatusHistoryEntity } from '../../entities';
import { OrderEventEntity } from '../../entities';
import { OrdersController } from '../../controllers';
import { OrdersService } from '../../services';
import { OrderRepository } from '../../repositories/order.repository';
import { OrderStatusHistoryRepository } from '../../repositories/order-status-history.repository';
import { OrderEventRepository } from '../../repositories/order-event.repository';
import { OrderStatusHistoryService } from '../../services';
import { OrderEventsService } from '../../services';
import { OrderLifecycleService } from '../../services/order-lifecycle.service';
import { OrderPricingService } from '../../services/order-pricing.service';
import {
  OrderDeliveryHook,
  OrderInventoryHook,
  OrderNotificationHook,
  OrderPaymentHook,
  OrderPromotionHook,
  OrderReportingHook,
} from '../../hooks';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderStatusHistoryEntity,
      OrderEventEntity,
      ProductEntity,
      VariantEntity,
    ]),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrderRepository,
    OrderStatusHistoryRepository,
    OrderEventRepository,
    OrderStatusHistoryService,
    OrderEventsService,
    OrderLifecycleService,
    OrderPricingService,
    OrderPromotionHook,
    OrderInventoryHook,
    OrderPaymentHook,
    OrderDeliveryHook,
    OrderNotificationHook,
    OrderReportingHook,
  ],
  exports: [OrderRepository, OrderPricingService, OrderPromotionHook],
})
export class OrdersFeatureModule {}
