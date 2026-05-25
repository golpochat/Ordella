import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CategoryEntity, ProductEntity } from '../catalog/entities';
import { GiftCardEntity, StoreCreditTransactionEntity } from '../giftcards/entities';
import { CustomerEntity, LoyaltyTransactionEntity } from '../loyalty/entities';
import { OrderEntity, OrderItemEntity } from '../orders/entities';
import { CrmController } from './controllers';
import { CRM_ENTITIES } from './entities';
import { CrmCustomersService } from './services';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      ...CRM_ENTITIES,
      CustomerEntity,
      LoyaltyTransactionEntity,
      GiftCardEntity,
      StoreCreditTransactionEntity,
      OrderEntity,
      OrderItemEntity,
      ProductEntity,
      CategoryEntity,
    ]),
  ],
  controllers: [CrmController],
  providers: [CrmCustomersService],
  exports: [CrmCustomersService],
})
export class CrmModule {}
