import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { ForecastSnapshotEntity } from '../forecast/entities/forecast-snapshot.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { DigitalTwinsController } from './controllers';
import { DIGITAL_TWINS_ENTITIES } from './entities';
import { DigitalTwinsService } from './services';

@Module({
  imports: [
    AuthModule,
    AuditModule,
    TypeOrmModule.forFeature([...DIGITAL_TWINS_ENTITIES, ForecastSnapshotEntity, OrderEntity]),
  ],
  controllers: [DigitalTwinsController],
  providers: [DigitalTwinsService],
  exports: [DigitalTwinsService],
})
export class DigitalTwinsModule {}
