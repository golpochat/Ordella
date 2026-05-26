import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import { AnalyticsInsightsQueryDto, UpdateAnalyticsInsightSettingsDto } from '../dto';
import { AnalyticsInsightsService } from '../services';

@Controller('analytics-insights')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.REPORTS)
export class AnalyticsInsightsController {
  constructor(private readonly analytics: AnalyticsInsightsService) {}

  @Get('dashboard')
  async dashboard(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AnalyticsInsightsQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.analytics.dashboard(tenant, query);
    return { success: true, data };
  }

  @Post('refresh')
  async refresh(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.analytics.refresh(tenant);
    return { success: true, data };
  }

  @Get('products/:id')
  async product(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.analytics.productDetail(tenant, id);
    return { success: true, data };
  }

  @Get('customers/:id')
  async customer(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.analytics.customerDetail(tenant, id);
    return { success: true, data };
  }

  @Get('cohorts/:cohort')
  async cohort(
    @CurrentTenant() tenant: TenantContext,
    @Param('cohort') cohort: string,
    @Query() query: AnalyticsInsightsQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.analytics.cohortDetail(tenant, cohort, query);
    return { success: true, data };
  }

  @Get('settings')
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  async settings(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.analytics.getSettings(tenant);
    return { success: true, data };
  }

  @Post('settings')
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  async updateSettings(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateAnalyticsInsightSettingsDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.analytics.updateSettings(tenant, dto);
    return { success: true, data };
  }
}
