import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationEntity } from '../../entities/integration.entity';
import { IntegrationsAppsController } from '../../controllers/integrations-apps.controller';
import { IntegrationsWebhooksController } from '../../controllers/integrations-webhooks.controller';
import {
  IntegrationsAppsService,
  IntegrationsWebhooksService,
} from '../../services/integrations.service';
import { IntegrationRepository } from '../../repositories/integration.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationEntity])],
  controllers: [IntegrationsAppsController, IntegrationsWebhooksController],
  providers: [IntegrationsAppsService, IntegrationsWebhooksService, IntegrationRepository],
  exports: [],
})
export class IntegrationsAppsModule {}
