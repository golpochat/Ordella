import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationEntity, IntegrationEventEntity, IntegrationLogEntity, IntegrationProviderEntity } from '../../entities';
import { IntegrationsAppsController } from '../../controllers';
import { IntegrationsWebhooksController } from '../../controllers';
import {
  IntegrationsAppsService,
  IntegrationsWebhooksService,
} from '../../services';
import { IntegrationRepository } from '../../repositories/integration.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationEntity, IntegrationProviderEntity, IntegrationLogEntity, IntegrationEventEntity])],
  controllers: [IntegrationsAppsController, IntegrationsWebhooksController],
  providers: [IntegrationsAppsService, IntegrationsWebhooksService, IntegrationRepository],
  exports: [],
})
export class IntegrationsAppsModule {}
