import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantContext, AuthenticatedUser } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, Public, RequirePermissions, RbacGuard } from '../../auth';
import { OnboardingPermissionKeys } from '../constants/rbac-permissions';
import { OnboardingStep } from '../enums/onboarding-step.enum';
import { InviteStaffDto, AssignStaffRoleDto, UpdateStaffStatusDto } from '../dto/staff.dto';
import { TenantSignupDto } from '../dto/tenant-signup.dto';
import { UpdateBillingDto } from '../dto/update-billing.dto';
import { UpdateBrandingDto, UpdateIconDto, UpdateLogoDto } from '../dto/update-branding.dto';
import { SwitchTenantDto } from '../dto/switch-tenant.dto';
import { OnboardingWizardService } from '../services/onboarding-wizard.service';
import { StaffManagementService } from '../services/staff-management.service';
import { TenantBillingService } from '../services/tenant-billing.service';
import { TenantBrandingService } from '../services/tenant-branding.service';
import { TenantSignupService } from '../services/tenant-signup.service';
import { TenantSwitcherService } from '../services/tenant-switcher.service';
import { OnboardingProvisioningService } from '../services/onboarding-provisioning.service';
import {
  CatalogStarterDto,
  InitSampleCatalogDto,
  UpdateBusinessDetailsDto,
  UpdateLocationSetupDto,
  UpdateOnboardingBrandingDto,
} from '../dto/onboarding-provisioning.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(
    private readonly signupService: TenantSignupService,
    private readonly wizardService: OnboardingWizardService,
    private readonly provisioningService: OnboardingProvisioningService,
    private readonly brandingService: TenantBrandingService,
    private readonly billingService: TenantBillingService,
    private readonly staffService: StaffManagementService,
    private readonly switcherService: TenantSwitcherService,
  ) {}

  @Public()
  @Post('signup')
  async signup(@Body() dto: TenantSignupDto): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.signupService.createTenant(dto.name, dto.email, dto.password);
    return { success: true, data };
  }

  @Get('tenants')
  @UseGuards(JwtAuthGuard)
  async listTenants(@CurrentUser() user: AuthenticatedUser): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.switcherService.listTenantsForUser(user);
    return { success: true, data };
  }

  @Post('tenants/switch')
  @UseGuards(JwtAuthGuard)
  async switchTenant(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SwitchTenantDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.switcherService.switchTenant(user, dto.tenantId);
    return { success: true, data };
  }

  @Post('start')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.ONBOARDING_UPDATE)
  async start(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.wizardService.start(user, tenant);
    return { success: true, data };
  }

  @Post('step/business')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.ONBOARDING_UPDATE)
  async stepBusiness(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateBusinessDetailsDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.provisioningService.saveBusinessDetails(user, tenant, dto);
    return { success: true, data };
  }

  @Post('step/location')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.ONBOARDING_UPDATE)
  async stepLocation(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateLocationSetupDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.provisioningService.saveLocationSetup(user, tenant, dto);
    return { success: true, data };
  }

  @Post('step/catalog')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.ONBOARDING_UPDATE)
  async stepCatalog(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CatalogStarterDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.provisioningService.saveCatalogStarter(user, tenant, dto);
    return { success: true, data };
  }

  @Post('catalog/init-sample')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.ONBOARDING_UPDATE)
  async initSampleCatalog(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: InitSampleCatalogDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.provisioningService.initCatalog(user, tenant, dto);
    return { success: true, data };
  }

  @Post('step/branding')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.TENANT_BRANDING_UPDATE)
  async stepBranding(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateOnboardingBrandingDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.provisioningService.updateBranding(user, tenant, dto);
    return { success: true, data };
  }

  @Get('setup-status')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.ONBOARDING_READ)
  async setupStatus(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.provisioningService.getSetupStatus(tenant.tenantId);
    return { success: true, data };
  }

  @Post('step/menu')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.ONBOARDING_UPDATE)
  async stepMenu(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.wizardService.completeStep(user, tenant, OnboardingStep.MENU);
    return { success: true, data };
  }

  @Post('step/pos')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.ONBOARDING_UPDATE)
  async stepPos(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.wizardService.completeStep(user, tenant, OnboardingStep.POS);
    return { success: true, data };
  }

  @Post('step/delivery')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.ONBOARDING_UPDATE)
  async stepDelivery(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.wizardService.completeStep(user, tenant, OnboardingStep.DELIVERY);
    return { success: true, data };
  }

  @Post('step/payments')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.ONBOARDING_UPDATE)
  async stepPayments(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.wizardService.completeStep(user, tenant, OnboardingStep.PAYMENTS);
    return { success: true, data };
  }

  @Post('complete')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.ONBOARDING_UPDATE)
  async complete(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.wizardService.finalize(user, tenant);
    return { success: true, data };
  }

  @Get('progress')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.ONBOARDING_READ)
  async progress(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.wizardService.getProgress(tenant.tenantId);
    return { success: true, data };
  }

  @Get('branding')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.TENANT_BRANDING_UPDATE)
  async getBranding(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.brandingService.getTheme(tenant.tenantId);
    return { success: true, data };
  }

  @Patch('branding')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.TENANT_BRANDING_UPDATE)
  async updateBranding(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateBrandingDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.brandingService.updateBranding(user, tenant, dto);
    return { success: true, data };
  }

  @Patch('branding/logo')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.TENANT_BRANDING_UPDATE)
  async updateLogo(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateLogoDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.brandingService.updateLogo(user, tenant, dto.logoUrl);
    return { success: true, data };
  }

  @Patch('branding/icon')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.TENANT_BRANDING_UPDATE)
  async updateIcon(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateIconDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.brandingService.updateIcon(user, tenant, dto.iconUrl);
    return { success: true, data };
  }

  @Get('billing')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.TENANT_BILLING_READ)
  async getBilling(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.billingService.getBilling(tenant.tenantId);
    return { success: true, data };
  }

  @Patch('billing')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.TENANT_BILLING_UPDATE)
  async updateBilling(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateBillingDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.billingService.updateBilling(user, tenant, dto);
    return { success: true, data };
  }

  @Get('staff')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.STAFF_READ)
  async listStaff(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.staffService.listStaff(tenant.tenantId);
    return { success: true, data };
  }

  @Post('staff/invite')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.STAFF_INVITE)
  async inviteStaff(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: InviteStaffDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.staffService.inviteStaff(user, tenant, dto.email, dto.roleName);
    return { success: true, data };
  }

  @Patch('staff/:userId/role')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.STAFF_UPDATE)
  async assignRole(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: AssignStaffRoleDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.staffService.assignRole(user, tenant, userId, dto.roleName);
    return { success: true, data };
  }

  @Patch('staff/:userId/status')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.STAFF_UPDATE)
  async updateStaffStatus(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateStaffStatusDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.staffService.setStaffActive(user, tenant, userId, dto.isActive);
    return { success: true, data };
  }
}
