import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import {
  AssignEnterpriseAccessDto,
  AssignRegionLocationsDto,
  CreateEnterpriseOrganizationDto,
  CreateEnterpriseRegionDto,
  UpdateEnterpriseSettingsDto,
} from '../dto';
import { EnterpriseScopeType } from '../entities';
import { EnterpriseService } from '../services/enterprise.service';

@Controller('enterprise')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class EnterpriseController {
  constructor(private readonly enterprise: EnterpriseService) {}

  @Get('hierarchy')
  @RequirePermissions('enterprise.read')
  async hierarchy(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.enterprise.hierarchy(tenant, user);
    return { success: true, data };
  }

  @Post('organizations')
  @RequirePermissions('enterprise.write')
  async createOrganization(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEnterpriseOrganizationDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.enterprise.createOrganization(tenant, dto, user);
    return { success: true, data };
  }

  @Patch('organizations/:id/settings')
  @RequirePermissions('enterprise.settings')
  async updateSettings(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEnterpriseSettingsDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.enterprise.updateSettings(tenant, id, dto, user);
    return { success: true, data };
  }

  @Patch('organizations/:id/sso-policy')
  @RequirePermissions('enterprise.sso')
  async updateSsoPolicy(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEnterpriseSettingsDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.enterprise.ssoPolicy(tenant, id, dto, user);
    return { success: true, data };
  }

  @Post('regions')
  @RequirePermissions('regions.write')
  async createRegion(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEnterpriseRegionDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.enterprise.createRegion(tenant, dto, user);
    return { success: true, data };
  }

  @Post('regions/:id/locations')
  @RequirePermissions('regions.write')
  async assignRegionLocations(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignRegionLocationsDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.enterprise.assignRegionLocations(tenant, id, dto, user);
    return { success: true, data };
  }

  @Post('access-assignments')
  @RequirePermissions('enterprise.roles')
  async assignAccess(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AssignEnterpriseAccessDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.enterprise.assignAccess(tenant, dto, user);
    return { success: true, data };
  }

  @Get('dashboard')
  @RequirePermissions('enterprise.dashboard')
  async dashboard(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Query('scopeType') scopeType?: EnterpriseScopeType,
    @Query('scopeId') scopeId?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.enterprise.dashboard(tenant, user, scopeType, scopeId);
    return { success: true, data };
  }
}
