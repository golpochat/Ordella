import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationEventEntity } from '../../entities/integration-event.entity';
import { IntegrationEventsController } from '../../controllers/integration-events.controller';
import { IntegrationEventsService } from '../../services/integration-events.service';
import { IntegrationEventRepository } from '../../repositories/integration-event.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationEventEntity])],
  controllers: [IntegrationEventsController],
  providers: [IntegrationEventsService, IntegrationEventRepository],
  exports: [IntegrationEventsService, IntegrationEventRepository],
})
export class IntegrationEventsModule {}
