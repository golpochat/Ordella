import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import { Public, RequirePermissions } from '../decorators';
import { SsoCallbackDto, SsoLoginDto, UpdateRoleMappingsDto, UpsertSsoProviderDto } from '../dto';
import { JwtAuthGuard, RbacGuard } from '../guards';
import { SsoService } from '../services';

@Controller('sso')
export class SsoController {
  constructor(private readonly sso: SsoService) {}

  @Get('providers')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  async listProviders(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.sso.listProviders(tenant);
    return { success: true, data };
  }

  @Post('providers/create')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  async createProvider(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertSsoProviderDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.sso.createProvider(tenant, dto);
    return { success: true, data };
  }

  @Post('providers/update')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  async updateProvider(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertSsoProviderDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.sso.updateProvider(tenant, dto);
    return { success: true, data };
  }

  @Public()
  @Post('login')
  @UseGuards(TenantGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: SsoLoginDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.sso.startLogin(tenant, dto);
    return { success: true, data };
  }

  @Public()
  @Post('callback')
  @UseGuards(TenantGuard)
  @HttpCode(HttpStatus.OK)
  async callback(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: SsoCallbackDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.sso.handleCallback(tenant, dto);
    return { success: true, data };
  }

  @Get('role-mappings')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  async listRoleMappings(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.sso.listRoleMappings(tenant);
    return { success: true, data };
  }

  @Post('role-mappings/update')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  async updateRoleMappings(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateRoleMappingsDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.sso.updateRoleMappings(tenant, dto);
    return { success: true, data };
  }

  @Get('federated-users')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  async listFederatedUsers(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.sso.listFederatedUsers(tenant);
    return { success: true, data };
  }

  @Post('federated-users/reset')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  async resetFederatedUser(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: { userId: string },
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.sso.resetUserOverrides(tenant, dto.userId);
    return { success: true, data };
  }
}
