import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DELIVERY_ENTITIES } from './entities';
import { DeliveryTasksFeatureModule } from './modules/delivery-tasks/delivery-tasks-feature.module';
import { DeliveryAssignmentsModule } from './modules/delivery-assignments/delivery-assignments.module';
import { DriverProfilesModule } from './modules/driver-profiles/driver-profiles.module';

/**
 * Deliveries domain — SRS §28 / §44, API Spec §7 (blueprint Delivery Service).
 *
 * Routes (/api/v1, tenant-scoped):
 * - /deliveries (delivery_tasks), /drivers (driver_profiles)
 * - /delivery-assignments
 * - GET /deliveries/:id/tracking, /status-history, POST /auto-assign
 */
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature(DELIVERY_ENTITIES),
    DeliveryTasksFeatureModule,
    DeliveryAssignmentsModule,
    DriverProfilesModule,
  ],
  exports: [
    DeliveryTasksFeatureModule,
    DeliveryAssignmentsModule,
    DriverProfilesModule,
    TypeOrmModule,
  ],
})
export class DeliveriesModule {}
