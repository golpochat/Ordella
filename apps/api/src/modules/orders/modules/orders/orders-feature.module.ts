import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../../catalog/entities/product.entity';
import { VariantEntity } from '../../../catalog/entities/variant.entity';
import { ModifierOptionEntity } from '../../../catalog/entities/modifier-option.entity';
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
import { OrderCreationService } from '../../services/order-creation.service';
import { OrderPricingService } from '../../services/order-pricing.service';
import { OrderPaymentService } from '../../services/order-payment.service';
import { OrderDeliveryService } from '../../services/order-delivery.service';
import { OrderNotificationService } from '../../services/order-notification.service';
import { OrderReportingService } from '../../services/order-reporting.service';
import { OrderTotalsService } from '../../services/order-totals.service';
import { OrderFeeCalculatorService } from '../../pricing/order-fee-calculator.service';
import {
  DeliveryService,
  InventoryService,
  NotificationsService,
  PaymentsService,
  PromotionsService,
  ReportingService,
} from '../../integrations';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderStatusHistoryEntity,
      OrderEventEntity,
      ProductEntity,
      VariantEntity,
      ModifierOptionEntity,
    ]),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrderCreationService,
    OrderRepository,
    OrderStatusHistoryRepository,
    OrderEventRepository,
    OrderStatusHistoryService,
    OrderEventsService,
    OrderLifecycleService,
    OrderPricingService,
    OrderPaymentService,
    OrderDeliveryService,
    OrderNotificationService,
    OrderReportingService,
    OrderTotalsService,
    OrderFeeCalculatorService,
    PromotionsService,
    InventoryService,
    PaymentsService,
    DeliveryService,
    NotificationsService,
    ReportingService,
  ],
  exports: [OrderRepository, OrderPricingService, PromotionsService],
})
export class OrdersFeatureModule {}
