import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProductEntity } from '../catalog/entities/product.entity';
import { VariantEntity } from '../catalog/entities/variant.entity';
import { GiftCardEntity, StoreCreditTransactionEntity } from '../giftcards/entities';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { CustomerEntity, LoyaltyTransactionEntity } from '../loyalty/entities';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrderEntity } from '../orders/entities/order.entity';
import { SubscriptionEntity } from '../subscriptions/entities';
import { CustomerAccountsController } from './customer-accounts.controller';
import { CustomerAccountsService } from './customer-accounts.service';
import { CUSTOMER_ACCOUNT_ENTITIES } from './entities';
import { CustomerAuthGuard } from './guards/customer-auth.guard';

@Module({
  imports: [
    AuthModule,
    LoyaltyModule,
    NotificationsModule,
    TypeOrmModule.forFeature([
      ...CUSTOMER_ACCOUNT_ENTITIES,
      CustomerEntity,
      LoyaltyTransactionEntity,
      GiftCardEntity,
      StoreCreditTransactionEntity,
      OrderEntity,
      ProductEntity,
      VariantEntity,
      SubscriptionEntity,
    ]),
  ],
  controllers: [CustomerAccountsController],
  providers: [CustomerAccountsService, CustomerAuthGuard],
  exports: [CustomerAccountsService],
})
export class CustomerAccountsModule {}
