import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../modules/auth/auth.module';
import { TenantSettingsEntity } from '../modules/onboarding/entities/tenant-settings.entity';
import { TENANTS_ENTITIES } from '../modules/tenants/entities';
import { TenantDomainEntity } from './entities/tenant-domain.entity';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { TenantRoutingMiddleware } from './middleware/tenant-routing.middleware';
import { TenantSettingsMiddleware } from './middleware/tenant-settings.middleware';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { SecurityHeadersMiddleware } from './middleware/security-headers.middleware';
import { LoggingInterceptor } from './monitoring/logging.interceptor';
import { SentryService } from './monitoring/sentry.service';
import { MigrationRunnerService } from './migrations/migration-runner.service';
import { TenantRoutingService } from './routing/tenant-routing.service';
import { RateLimitService } from './security/rate-limit.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([...TENANTS_ENTITIES, TenantDomainEntity, TenantSettingsEntity])],
  controllers: [HealthController],
  providers: [
    TenantRoutingService,
    RateLimitService,
    HealthService,
    SentryService,
    MigrationRunnerService,
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
  exports: [TenantRoutingService, MigrationRunnerService, HealthService],
})
export class PlatformModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(SecurityHeadersMiddleware, TenantRoutingMiddleware, TenantSettingsMiddleware, RateLimitMiddleware)
      .forRoutes('*');
  }
}
