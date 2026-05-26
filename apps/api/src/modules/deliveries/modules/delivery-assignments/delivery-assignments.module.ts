import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryAssignmentEntity, DeliveryTaskEntity, DriverProfileEntity } from '../../entities';
import { DeliveryAssignmentsController } from '../../controllers';
import { DeliveryAssignmentsService } from '../../services';
import { DeliveryAssignmentRepository } from '../../repositories/delivery-assignment.repository';
import { DeliveryTaskRepository } from '../../repositories/delivery-task.repository';
import { DeliveriesCoreModule } from '../deliveries-core/deliveries-core.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryAssignmentEntity, DeliveryTaskEntity, DriverProfileEntity]),
    DeliveriesCoreModule,
  ],
  controllers: [DeliveryAssignmentsController],
  providers: [DeliveryAssignmentsService, DeliveryAssignmentRepository, DeliveryTaskRepository],
  exports: [],
})
export class DeliveryAssignmentsModule {}
