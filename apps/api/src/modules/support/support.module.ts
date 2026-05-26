import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../auth/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { CustomerSessionEntity } from '../customer-accounts/entities';
import { CustomerAuthGuard } from '../customer-accounts/guards/customer-auth.guard';
import { DeliveryEventEntity } from '../deliveries/entities/delivery-event.entity';
import { DeliveryTaskEntity } from '../deliveries/entities/delivery-task.entity';
import { CustomerEntity } from '../loyalty/entities';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrderEntity } from '../orders/entities/order.entity';
import { SubscriptionEntity } from '../subscriptions/entities';
import { AdminSupportController, CustomerSupportController, PublicSupportController } from './controllers';
import { SUPPORT_ENTITIES } from './entities';
import { SupportService } from './services';

@Module({
  imports: [
    AuthModule,
    NotificationsModule,
    TypeOrmModule.forFeature([
      ...SUPPORT_ENTITIES,
      CustomerEntity,
      UserEntity,
      OrderEntity,
      DeliveryTaskEntity,
      DeliveryEventEntity,
      SubscriptionEntity,
      CustomerSessionEntity,
    ]),
  ],
  controllers: [AdminSupportController, CustomerSupportController, PublicSupportController],
  providers: [CustomerAuthGuard, SupportService],
  exports: [SupportService],
})
export class SupportModule {}
