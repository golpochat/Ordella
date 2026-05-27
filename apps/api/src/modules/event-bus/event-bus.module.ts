import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsFeatureModule } from '../notifications/modules/notifications/notifications-feature.module';
import { EventBusController } from './controllers';
import { EVENT_BUS_ENTITIES } from './entities';
import { EventBusService } from './services';

@Module({
  imports: [
    AuthModule,
    AuditModule,
    NotificationsFeatureModule,
    TypeOrmModule.forFeature(EVENT_BUS_ENTITIES),
  ],
  controllers: [EventBusController],
  providers: [EventBusService],
  exports: [EventBusService],
})
export class EventBusModule {}
