import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../../../orders/entities/order.entity';
import { ProductEntity } from '../../../catalog/entities/product.entity';
import { DeliveryTaskEntity } from '../../entities';
import { DeliveryStatusHistoryEntity } from '../../entities';
import { DeliveriesController } from '../../controllers';
import { DeliveriesCrudService } from '../../services/deliveries-crud.service';
import { DeliveryTaskRepository } from '../../repositories/delivery-task.repository';
import { DeliveryStatusHistoryRepository } from '../../repositories/delivery-status-history.repository';
import { DeliveriesCoreModule } from '../deliveries-core/deliveries-core.module';
import { DeliveriesRealtimeModule } from '../deliveries-realtime/deliveries-realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeliveryTaskEntity,
      DeliveryStatusHistoryEntity,
      OrderEntity,
      ProductEntity,
    ]),
    DeliveriesCoreModule,
    DeliveriesRealtimeModule,
  ],
  controllers: [DeliveriesController],
  providers: [
    DeliveriesCrudService,
    DeliveryTaskRepository,
    DeliveryStatusHistoryRepository,
  ],
  exports: [DeliveryTaskRepository],
})
export class DeliveryTasksFeatureModule {}
