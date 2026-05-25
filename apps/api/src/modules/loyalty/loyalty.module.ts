import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LOYALTY_ENTITIES } from './entities';
import { LoyaltyController, PublicLoyaltyController } from './controllers';
import { LoyaltyService } from './services';

@Module({
  imports: [AuthModule, NotificationsModule, TypeOrmModule.forFeature(LOYALTY_ENTITIES)],
  controllers: [LoyaltyController, PublicLoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService, TypeOrmModule],
})
export class LoyaltyModule {}
