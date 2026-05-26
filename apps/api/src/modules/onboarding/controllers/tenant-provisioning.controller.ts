import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantContext, AuthenticatedUser } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, Public, RequirePermissions, RbacGuard } from '../../auth';
import { OnboardingPermissionKeys } from '../constants/rbac-permissions';
import { TenantSignupDto } from '../dto/tenant-signup.dto';
import {
  CatalogStarterDto,
  InitSampleCatalogDto,
  UpdateBusinessDetailsDto,
  UpdateLocationSetupDto,
  UpdateOnboardingBrandingDto,
  UpdateTenantSettingsDto,
} from '../dto/onboarding-provisioning.dto';
import { OnboardingProvisioningService } from '../services/onboarding-provisioning.service';
import { TenantSignupService } from '../services/tenant-signup.service';
import { throwCrossTenantAccess } from '../domain/onboarding.errors';

@Controller('tenant')
export class TenantProvisioningController {
  constructor(
    private readonly signupService: TenantSignupService,
    private readonly provisioning: OnboardingProvisioningService,
  ) {}

  @Public()
  @Post('create')
  async create(@Body() dto: TenantSignupDto): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.signupService.createTenant(dto.name, dto.email, dto.password);
    return { success: true, data };
  }

  @Public()
  @Get('settings')
  @UseGuards(TenantGuard)
  async getSettings(
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.provisioning.getTenantSettings(tenant);
    return { success: true, data };
  }

  @Post(':tenantId/location/create')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.ONBOARDING_UPDATE)
  async createLocation(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: UpdateLocationSetupDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    this.assertTenantParam(tenant, tenantId);
    const data = await this.provisioning.saveLocationSetup(user, tenant, dto);
    return { success: true, data };
  }

  @Post(':tenantId/catalog/init')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.ONBOARDING_UPDATE)
  async initCatalog(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: InitSampleCatalogDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    this.assertTenantParam(tenant, tenantId);
    const data = await this.provisioning.initCatalog(user, tenant, dto);
    return { success: true, data };
  }

  @Post(':tenantId/settings/update')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.TENANT_SETTINGS_UPDATE)
  async updateSettings(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: UpdateTenantSettingsDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    this.assertTenantParam(tenant, tenantId);
    const data = await this.provisioning.updateSettings(user, tenant, dto);
    return { success: true, data };
  }

  @Post(':tenantId/branding/update')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(OnboardingPermissionKeys.TENANT_BRANDING_UPDATE)
  async updateBranding(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentTenant() tenant: TenantContext,
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: UpdateOnboardingBrandingDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    this.assertTenantParam(tenant, tenantId);
    const data = await this.provisioning.updateBranding(user, tenant, dto);
    return { success: true, data };
  }

  private assertTenantParam(tenant: TenantContext, tenantId: string): void {
    if (tenant.tenantId !== tenantId) {
      throwCrossTenantAccess();
    }
  }
}
