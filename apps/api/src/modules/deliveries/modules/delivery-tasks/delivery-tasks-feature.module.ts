import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryTaskEntity } from '../../entities';
import { DeliveryStatusHistoryEntity } from '../../entities';
import { DeliveriesController } from '../../controllers';
import { DeliveriesCrudService } from '../../services/deliveries-crud.service';
import { DeliveryTaskRepository } from '../../repositories/delivery-task.repository';
import { DeliveryStatusHistoryRepository } from '../../repositories/delivery-status-history.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryTaskEntity, DeliveryStatusHistoryEntity])],
  controllers: [DeliveriesController],
  providers: [DeliveriesCrudService, DeliveryTaskRepository, DeliveryStatusHistoryRepository],
  exports: [],
})
export class DeliveryTasksFeatureModule {}
