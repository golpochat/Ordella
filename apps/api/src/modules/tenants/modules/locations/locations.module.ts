import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingModule } from '../../../billing/billing.module';
import { UserEntity } from '../../../auth/entities/user.entity';
import { StockItemEntity } from '../../../inventory/entities/stock-item.entity';
import { OrderEntity } from '../../../orders/entities/order.entity';
import { LocationEntity } from '../../entities';
import { LocationSettingsEntity } from '../../entities';
import { LocationOpeningHoursEntity } from '../../entities';
import { UserLocationAssignmentEntity } from '../../entities/user-location-assignment.entity';
import { LocationsController } from '../../controllers';
import { LocationsService } from '../../services';
import { LocationRepository } from '../../repositories/location.repository';
import { LocationSettingsRepository } from '../../repositories/location-settings.repository';
import { LocationOpeningHoursRepository } from '../../repositories/location-opening-hours.repository';
import { UserLocationRepository } from '../../repositories/user-location.repository';

@Module({
  imports: [
    BillingModule,
    TypeOrmModule.forFeature([
      LocationEntity,
      LocationSettingsEntity,
      LocationOpeningHoursEntity,
      UserLocationAssignmentEntity,
      UserEntity,
      StockItemEntity,
      OrderEntity,
    ]),
  ],
  controllers: [LocationsController],
  providers: [
    LocationsService,
    LocationRepository,
    LocationSettingsRepository,
    LocationOpeningHoursRepository,
    UserLocationRepository,
  ],
  exports: [LocationsService],
})
export class LocationsFeatureModule {}
