import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from '../../entities';
import { LocationSettingsEntity } from '../../entities';
import { LocationOpeningHoursEntity } from '../../entities';
import { LocationsController } from '../../controllers';
import { LocationsService } from '../../services';
import { LocationRepository } from '../../repositories/location.repository';
import { LocationSettingsRepository } from '../../repositories/location-settings.repository';
import { LocationOpeningHoursRepository } from '../../repositories/location-opening-hours.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LocationEntity,
      LocationSettingsEntity,
      LocationOpeningHoursEntity,
    ]),
  ],
  controllers: [LocationsController],
  providers: [
    LocationsService,
    LocationRepository,
    LocationSettingsRepository,
    LocationOpeningHoursRepository,
  ],
  exports: [],
})
export class LocationsFeatureModule {}
