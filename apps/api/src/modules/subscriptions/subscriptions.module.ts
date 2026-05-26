import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BillingModule } from '../billing/billing.module';
import { CustomerSessionEntity } from '../customer-accounts/entities';
import { CustomerAuthGuard } from '../customer-accounts/guards/customer-auth.guard';
import { CustomerEntity } from '../loyalty/entities';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersFeatureModule } from '../orders/modules/orders/orders-feature.module';
import {
  AdminSubscriptionsController,
  CustomerSubscriptionsController,
  StorefrontSubscriptionsController,
} from './controllers';
import { SUBSCRIPTION_ENTITIES } from './entities';
import { SubscriptionSchedulerService, SubscriptionsService } from './services';

@Module({
  imports: [
    AuthModule,
    BillingModule,
    NotificationsModule,
    OrdersFeatureModule,
    TypeOrmModule.forFeature([...SUBSCRIPTION_ENTITIES, CustomerEntity, CustomerSessionEntity]),
  ],
  controllers: [
    AdminSubscriptionsController,
    CustomerSubscriptionsController,
    StorefrontSubscriptionsController,
  ],
  providers: [CustomerAuthGuard, SubscriptionsService, SubscriptionSchedulerService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
