import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DeliveryEventEntity,
  DeliveryAssignmentEntity,
  DeliveryStatusHistoryEntity,
  DeliveryTaskEntity,
  DriverProfileEntity,
} from '../../entities';
import { DeliveryService } from '../../services/delivery.service';
import { DeliveryTaskRepository } from '../../repositories/delivery-task.repository';
import { DeliveryAssignmentRepository } from '../../repositories/delivery-assignment.repository';
import { DriverProfileRepository } from '../../repositories/driver-profile.repository';
import { DeliveryStatusHistoryRepository } from '../../repositories/delivery-status-history.repository';
import { DeliveryEventRepository } from '../../repositories/delivery-event.repository';
import {
  DriverTrackingService,
  ExternalDeliveryProviderService,
  RouteOptimizationService,
} from '../../integrations';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeliveryTaskEntity,
      DriverProfileEntity,
      DeliveryAssignmentEntity,
      DeliveryStatusHistoryEntity,
      DeliveryEventEntity,
    ]),
  ],
  providers: [
    DeliveryService,
    DeliveryTaskRepository,
    DeliveryAssignmentRepository,
    DriverProfileRepository,
    DeliveryStatusHistoryRepository,
    DeliveryEventRepository,
    ExternalDeliveryProviderService,
    RouteOptimizationService,
    DriverTrackingService,
  ],
  exports: [DeliveryService],
})
export class DeliveriesCoreModule {}
