import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CustomerEntity } from '../loyalty/entities/customer.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { GIFT_CARD_ENTITIES } from './entities';
import {
  GiftCardsController,
  PublicGiftCardsController,
  PublicStoreCreditController,
  StoreCreditController,
} from './controllers';
import { GiftCardsService } from './services';

@Module({
  imports: [
    AuthModule,
    NotificationsModule,
    TypeOrmModule.forFeature([...GIFT_CARD_ENTITIES, CustomerEntity]),
  ],
  controllers: [
    GiftCardsController,
    StoreCreditController,
    PublicGiftCardsController,
    PublicStoreCreditController,
  ],
  providers: [GiftCardsService],
  exports: [GiftCardsService, TypeOrmModule],
})
export class GiftCardsModule {}
