import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { INTEGRATIONS_ENTITIES } from './entities';
import { IntegrationsAppsModule } from './modules/integrations-apps/integrations-apps.module';
import { IntegrationProvidersModule } from './modules/integration-providers/integration-providers.module';
import { IntegrationEventsModule } from './modules/integration-events/integration-events.module';
import { IntegrationLogsModule } from './modules/integration-logs/integration-logs.module';

/**
 * Integrations domain — SRS §59, API Spec §13 (blueprint Integrations Service).
 *
 * Routes (/api/v1):
 * - /integrations/apps, /integrations/{delivery|payments|pos}/webhook
 * - /integration-providers, /integration-events, /integration-logs
 */
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature(INTEGRATIONS_ENTITIES),
    IntegrationProvidersModule,
    IntegrationsAppsModule,
    IntegrationEventsModule,
    IntegrationLogsModule,
  ],
  exports: [
    IntegrationsAppsModule,
    IntegrationProvidersModule,
    IntegrationEventsModule,
    IntegrationLogsModule,
    TypeOrmModule,
  ],
})
export class IntegrationsModule {}
