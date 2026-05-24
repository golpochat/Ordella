import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AUTH_ENTITIES } from '../auth/entities';
import { TENANTS_ENTITIES } from '../tenants/entities';
import { ONBOARDING_ENTITIES } from './entities';
import { OnboardingController } from './controllers/onboarding.controller';
import { PublicThemeController } from './controllers/public-theme.controller';
import { OnboardingRepository } from './repositories/onboarding.repositories';
import { OnboardingWizardService } from './services/onboarding-wizard.service';
import { StaffManagementService } from './services/staff-management.service';
import { TenantAccessService } from './services/tenant-access.service';
import { TenantBillingService } from './services/tenant-billing.service';
import { TenantBrandingService } from './services/tenant-branding.service';
import { TenantSignupService } from './services/tenant-signup.service';
import { TenantSwitcherService } from './services/tenant-switcher.service';
import { ThemeRegistryService } from './services/theme-registry.service';
import { DomainResolverService } from './services/domain-resolver.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([...ONBOARDING_ENTITIES, ...AUTH_ENTITIES, ...TENANTS_ENTITIES]),
  ],
  controllers: [OnboardingController, PublicThemeController],
  providers: [
    OnboardingRepository,
    TenantAccessService,
    TenantSignupService,
    TenantBrandingService,
    TenantBillingService,
    StaffManagementService,
    OnboardingWizardService,
    TenantSwitcherService,
    ThemeRegistryService,
    DomainResolverService,
  ],
  exports: [
    TenantSignupService,
    TenantSwitcherService,
    TenantAccessService,
    ThemeRegistryService,
    TenantBrandingService,
  ],
})
export class OnboardingModule {}
