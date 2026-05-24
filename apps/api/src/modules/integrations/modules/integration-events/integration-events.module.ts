import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationEventEntity } from '../../entities';
import { IntegrationEventsController } from '../../controllers';
import { IntegrationEventsService } from '../../services';
import { IntegrationEventRepository } from '../../repositories/integration-event.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationEventEntity])],
  controllers: [IntegrationEventsController],
  providers: [IntegrationEventsService, IntegrationEventRepository],
  exports: [],
})
export class IntegrationEventsModule {}
