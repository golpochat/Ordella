import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrderEntity } from '../orders/entities/order.entity';
import { LOYALTY_ENTITIES } from './entities';
import { LoyaltyController, PublicLoyaltyController } from './controllers';
import { LoyaltyService } from './services';
import { SearchModule } from '../search';

@Module({
  imports: [AuthModule, NotificationsModule, SearchModule, TypeOrmModule.forFeature([...LOYALTY_ENTITIES, OrderEntity])],
  controllers: [LoyaltyController, PublicLoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService, TypeOrmModule],
})
export class LoyaltyModule {}
