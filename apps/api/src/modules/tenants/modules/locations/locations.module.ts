import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from '../../entities/location.entity';
import { LocationSettingsEntity } from '../../entities/location-settings.entity';
import { LocationOpeningHoursEntity } from '../../entities/location-opening-hours.entity';
import { LocationsController } from '../../controllers/locations.controller';
import { LocationsService } from '../../services/locations.service';
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
