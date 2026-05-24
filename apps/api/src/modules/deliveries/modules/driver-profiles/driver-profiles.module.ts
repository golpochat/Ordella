import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverProfileEntity } from '../../entities';
import { DriversController } from '../../controllers';
import { DriversService } from '../../services';
import { DriverProfileRepository } from '../../repositories/driver-profile.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DriverProfileEntity])],
  controllers: [DriversController],
  providers: [DriversService, DriverProfileRepository],
  exports: [],
})
export class DriverProfilesModule {}
