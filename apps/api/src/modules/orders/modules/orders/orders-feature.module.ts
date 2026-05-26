import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../../../catalog/entities/product.entity';
import { VariantEntity } from '../../../catalog/entities/variant.entity';
import { ModifierOptionEntity } from '../../../catalog/entities/modifier-option.entity';
import { BundleEntity } from '../../../bundles/entities/bundle.entity';
import { OrderEntity } from '../../entities';
import { OrderItemEntity } from '../../entities';
import { OrderStatusHistoryEntity } from '../../entities';
import { OrderEventEntity } from '../../entities';
import { OrderItemRepository } from '../../repositories/order-item.repository';
import { OrdersController, OrdersPosController } from '../../controllers';
import { OrdersFulfillmentController } from '../../../kds/controllers/orders-fulfillment.controller';
import { KdsModule } from '../../../kds/kds.module';
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
import { OrderAccessService } from '../../services/order-access.service';
import { OrderInventoryService } from '../../services/order-inventory.service';
import { OrderPromotionsService } from '../../services/order-promotions.service';
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
import { InventoryCoreModule } from '../../../inventory/modules/inventory-core/inventory-core.module';
import { NotificationsModule } from '../../../notifications/notifications.module';
import { LoyaltyModule } from '../../../loyalty/loyalty.module';
import { GiftCardsModule } from '../../../giftcards/giftcards.module';
import { PromotionsCoreModule } from '../../../promotions/modules/promotions-core/promotions-core.module';
import { SearchModule } from '../../../search';
import { TaxModule } from '../../../tax';
import { TenantSettingsEntity } from '../../../onboarding/entities/tenant-settings.entity';

@Module({
  imports: [
    InventoryCoreModule,
    NotificationsModule,
    LoyaltyModule,
    GiftCardsModule,
    PromotionsCoreModule,
    SearchModule,
    TaxModule,
    forwardRef(() => KdsModule),
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
      OrderStatusHistoryEntity,
      OrderEventEntity,
      ProductEntity,
      VariantEntity,
      ModifierOptionEntity,
      BundleEntity,
      TenantSettingsEntity,
    ]),
  ],
  controllers: [OrdersFulfillmentController, OrdersPosController, OrdersController],
  providers: [
    OrdersService,
    OrderCreationService,
    OrderRepository,
    OrderItemRepository,
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
    OrderAccessService,
    OrderInventoryService,
    OrderPromotionsService,
    OrderTotalsService,
    OrderFeeCalculatorService,
    PromotionsService,
    InventoryService,
    PaymentsService,
    DeliveryService,
    NotificationsService,
    ReportingService,
  ],
  exports: [
    OrdersService,
    OrderLifecycleService,
    OrderAccessService,
    OrderRepository,
    OrderItemRepository,
    OrderPricingService,
    PromotionsService,
  ],
})
export class OrdersFeatureModule {}
