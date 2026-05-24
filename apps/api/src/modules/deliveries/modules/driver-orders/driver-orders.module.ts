import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../../../orders/entities/order.entity';
import { ProductEntity } from '../../../catalog/entities/product.entity';
import { OrdersFeatureModule } from '../../../orders/modules/orders/orders-feature.module';
import { DeliveryTaskEntity } from '../../entities';
import { DriverProfileEntity } from '../../entities';
import { DriverOrdersController, DriverLocationController } from '../../controllers/driver-orders.controller';
import { DriverOrdersService } from '../../services/driver-orders.service';
import { DeliveryTaskRepository } from '../../repositories/delivery-task.repository';
import { DriverProfileRepository } from '../../repositories/driver-profile.repository';
import { DeliveriesCoreModule } from '../deliveries-core/deliveries-core.module';
import { DeliveriesRealtimeModule } from '../deliveries-realtime/deliveries-realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryTaskEntity, DriverProfileEntity, OrderEntity, ProductEntity]),
    DeliveriesCoreModule,
    DeliveriesRealtimeModule,
    OrdersFeatureModule,
  ],
  controllers: [DriverOrdersController, DriverLocationController],
  providers: [DriverOrdersService, DeliveryTaskRepository, DriverProfileRepository],
})
export class DriverOrdersModule {}
