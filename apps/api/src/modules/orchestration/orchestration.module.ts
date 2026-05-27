import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { EventStoreRecordEntity } from '../event-bus/entities/event-store-record.entity';
import { NotificationsFeatureModule } from '../notifications/modules/notifications/notifications-feature.module';
import { OrchestrationController } from './controllers';
import { ORCHESTRATION_ENTITIES } from './entities';
import { OrchestrationService } from './services';

@Module({
  imports: [
    AuthModule,
    AuditModule,
    NotificationsFeatureModule,
    TypeOrmModule.forFeature([...ORCHESTRATION_ENTITIES, EventStoreRecordEntity]),
  ],
  controllers: [OrchestrationController],
  providers: [OrchestrationService],
  exports: [OrchestrationService],
})
export class OrchestrationModule {}
