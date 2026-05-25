import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, Public, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import { UpdateThemeDto, UploadThemeAssetDto } from '../dto';
import { ThemesService } from '../services';

@Controller('themes')
export class ThemesController {
  constructor(private readonly themes: ThemesService) {}

  @Public()
  @Get('current')
  async current(
    @Query('tenantId') tenantId: string | undefined,
    @CurrentTenant() tenant?: TenantContext,
  ): Promise<ApiSuccessResponse<unknown>> {
    const resolvedTenantId = tenantId ?? tenant?.tenantId;
    if (!resolvedTenantId?.trim()) {
      throw new BadRequestException('tenantId is required');
    }
    const data = await this.themes.current(resolvedTenantId);
    return { success: true, data };
  }

  @Public()
  @Get('base-themes')
  baseThemes(): ApiSuccessResponse<unknown[]> {
    return { success: true, data: this.themes.baseThemes() };
  }

  @Post('update')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateThemeDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.themes.update(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('upload-asset')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  async uploadAsset(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UploadThemeAssetDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.themes.uploadAsset(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('reset')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  async reset(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.themes.reset(tenant.tenantId);
    return { success: true, data };
  }
}
