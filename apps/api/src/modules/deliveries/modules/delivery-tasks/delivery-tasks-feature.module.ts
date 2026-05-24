import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryTaskEntity } from '../../entities/delivery-task.entity';
import { DeliveryStatusHistoryEntity } from '../../entities/delivery-status-history.entity';
import { DeliveriesController } from '../../controllers/deliveries.controller';
import { DeliveriesService } from '../../services/deliveries.service';
import { DeliveryTaskRepository } from '../../repositories/delivery-task.repository';
import { DeliveryStatusHistoryRepository } from '../../repositories/delivery-status-history.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryTaskEntity, DeliveryStatusHistoryEntity])],
  controllers: [DeliveriesController],
  providers: [DeliveriesService, DeliveryTaskRepository, DeliveryStatusHistoryRepository],
  exports: [DeliveriesService, DeliveryTaskRepository, DeliveryStatusHistoryRepository],
})
export class DeliveryTasksFeatureModule {}
