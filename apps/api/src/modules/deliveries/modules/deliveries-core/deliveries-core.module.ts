import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DeliveryEventEntity,
  DeliveryStatusHistoryEntity,
  DeliveryTaskEntity,
  DriverProfileEntity,
} from '../../entities';
import { DeliveryService } from '../../services/delivery.service';
import { DeliveryTaskRepository } from '../../repositories/delivery-task.repository';
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
      DeliveryStatusHistoryEntity,
      DeliveryEventEntity,
    ]),
  ],
  providers: [
    DeliveryService,
    DeliveryTaskRepository,
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
