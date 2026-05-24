import { Module } from '@nestjs/common';
import { PlatformModule } from '../../platform/platform.module';
import { AuthModule } from '../auth/auth.module';
import { OnboardingController } from './controllers/onboarding.controller';
import { TenantProvisioningController } from './controllers/tenant-provisioning.controller';
import { PublicThemeController } from './controllers/public-theme.controller';
import { OnboardingDataModule } from './onboarding-data.module';
import { OnboardingWizardService } from './services/onboarding-wizard.service';
import { StaffManagementService } from './services/staff-management.service';
import { TenantAccessService } from './services/tenant-access.service';
import { TenantBillingService } from './services/tenant-billing.service';
import { TenantBrandingService } from './services/tenant-branding.service';
import { TenantSignupService } from './services/tenant-signup.service';
import { TenantSwitcherService } from './services/tenant-switcher.service';
import { ThemeRegistryService } from './services/theme-registry.service';
import { DomainResolverService } from './services/domain-resolver.service';
import { OnboardingProvisioningService } from './services/onboarding-provisioning.service';

@Module({
  imports: [PlatformModule, AuthModule, OnboardingDataModule],
  controllers: [OnboardingController, TenantProvisioningController, PublicThemeController],
  providers: [
    TenantAccessService,
    TenantSignupService,
    TenantBrandingService,
    TenantBillingService,
    StaffManagementService,
    OnboardingWizardService,
    OnboardingProvisioningService,
    TenantSwitcherService,
    ThemeRegistryService,
    DomainResolverService,
  ],
  exports: [
    OnboardingDataModule,
    TenantSignupService,
    TenantSwitcherService,
    TenantAccessService,
    ThemeRegistryService,
    TenantBrandingService,
  ],
})
export class OnboardingModule {}
