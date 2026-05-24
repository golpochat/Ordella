import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DELIVERIES_ENTITIES } from './entities';
import { DeliveryTasksFeatureModule } from './modules/delivery-tasks/delivery-tasks-feature.module';
import { DeliveryAssignmentsModule } from './modules/delivery-assignments/delivery-assignments.module';
import { DriverProfilesModule } from './modules/driver-profiles/driver-profiles.module';
import { DriverOrdersModule } from './modules/driver-orders/driver-orders.module';
import { DeliveriesCoreModule } from './modules/deliveries-core/deliveries-core.module';

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
    TypeOrmModule.forFeature(DELIVERIES_ENTITIES),
    DeliveryTasksFeatureModule,
    DeliveryAssignmentsModule,
    DriverProfilesModule,
    DriverOrdersModule,
    DeliveriesCoreModule,
  ],
  exports: [DeliveriesCoreModule, DeliveryTasksFeatureModule, DriverProfilesModule],
})
export class DeliveriesModule {}
