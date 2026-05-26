import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { UserEntity } from '../auth/entities';
import { AuthModule } from '../auth/auth.module';
import { DeliveryTaskEntity } from '../deliveries/entities';
import { ForecastSnapshotEntity } from '../forecast/entities/forecast-snapshot.entity';
import { StockItemEntity } from '../inventory/entities';
import { CustomerEntity } from '../loyalty/entities';
import { OrderEntity } from '../orders/entities';
import { StaffShiftEntity } from '../staff-scheduling/entities/staff-shift.entity';
import { SupportTicketEntity } from '../support/entities/support-ticket.entity';
import { AiAssistantController } from './controllers';
import { AI_ASSISTANT_ENTITIES } from './entities';
import { AiAssistantService } from './services';

@Module({
  imports: [
    AuthModule,
    AuditModule,
    TypeOrmModule.forFeature([
      ...AI_ASSISTANT_ENTITIES,
      CustomerEntity,
      DeliveryTaskEntity,
      ForecastSnapshotEntity,
      OrderEntity,
      StaffShiftEntity,
      StockItemEntity,
      SupportTicketEntity,
      UserEntity,
    ]),
  ],
  controllers: [AiAssistantController],
  providers: [AiAssistantService],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
