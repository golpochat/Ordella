import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { ONBOARDING_ENTITIES } from '../onboarding/entities';
import { TENANTS_ENTITIES } from '../tenants/entities';
import { OrderEntity } from '../orders/entities/order.entity';
import { BillingController } from './controllers/billing.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import { BillingRepository } from './repositories/billing.repository';
import { StripeClientService } from './services/stripe-client.service';
import { TenantBillingService } from './services/tenant-billing.service';
import { StripeWebhookHandler } from './services/stripe-webhook.handler';
import { UsageTrackingService } from './services/usage-tracking.service';

@Module({
  imports: [
    OnboardingModule,
    TypeOrmModule.forFeature([...ONBOARDING_ENTITIES, ...TENANTS_ENTITIES, OrderEntity]),
  ],
  controllers: [BillingController, StripeWebhookController],
  providers: [
    BillingRepository,
    StripeClientService,
    TenantBillingService,
    StripeWebhookHandler,
    UsageTrackingService,
  ],
  exports: [UsageTrackingService, TenantBillingService, StripeClientService],
})
export class BillingModule {}
