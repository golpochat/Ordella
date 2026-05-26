import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateLimitService } from '../../platform/security/rate-limit.service';
import { AuditLogEntity } from '../audit/entities';
import { AuthModule } from '../auth/auth.module';
import { ApiKeyUsageLogEntity } from '../auth/entities';
import { ProductEntity } from '../catalog/entities/product.entity';
import { CategoryEntity } from '../catalog/entities/category.entity';
import { VariantEntity } from '../catalog/entities/variant.entity';
import { StockItemEntity } from '../inventory/entities/stock-item.entity';
import { CustomerEntity } from '../loyalty/entities';
import { OrderEntity } from '../orders/entities';
import { LocationEntity } from '../tenants/entities/location.entity';
import { INTEGRATIONS_ENTITIES } from './entities';
import { DeveloperPlatformController, IntegrationPublicApiController, WebhooksController } from './controllers';
import { WebhookEventsInterceptor } from './interceptors/webhook-events.interceptor';
import { IntegrationsAppsModule } from './modules/integrations-apps/integrations-apps.module';
import { IntegrationProvidersModule } from './modules/integration-providers/integration-providers.module';
import { IntegrationEventsModule } from './modules/integration-events/integration-events.module';
import { IntegrationLogsModule } from './modules/integration-logs/integration-logs.module';
import { IntegrationPublicApiService, WebhooksService } from './services';

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
    TypeOrmModule.forFeature([
      ...INTEGRATIONS_ENTITIES,
      AuditLogEntity,
      ApiKeyUsageLogEntity,
      OrderEntity,
      ProductEntity,
      CategoryEntity,
      VariantEntity,
      StockItemEntity,
      CustomerEntity,
      LocationEntity,
    ]),
    IntegrationProvidersModule,
    IntegrationsAppsModule,
    IntegrationEventsModule,
    IntegrationLogsModule,
  ],
  controllers: [DeveloperPlatformController, IntegrationPublicApiController, WebhooksController],
  providers: [
    IntegrationPublicApiService,
    WebhooksService,
    RateLimitService,
    {
      provide: APP_INTERCEPTOR,
      useClass: WebhookEventsInterceptor,
    },
  ],
  exports: [WebhooksService],
})
export class IntegrationsModule {}
