import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../auth/entities';
import { AuthModule } from '../auth/auth.module';
import { DriverProfileEntity } from '../deliveries/entities';
import { ForecastSnapshotEntity } from '../forecast/entities';
import { WarehousePickTaskEntity } from '../warehouse/entities';
import { StaffSchedulingController } from './controllers';
import { STAFF_SCHEDULING_ENTITIES } from './entities';
import { StaffSchedulingService } from './services';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      ...STAFF_SCHEDULING_ENTITIES,
      UserEntity,
      DriverProfileEntity,
      ForecastSnapshotEntity,
      WarehousePickTaskEntity,
    ]),
  ],
  controllers: [StaffSchedulingController],
  providers: [StaffSchedulingService],
  exports: [StaffSchedulingService],
})
export class StaffSchedulingModule {}
