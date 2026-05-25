import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { ReportsPermissionKeys } from '../../reports/constants/permission-keys';
import { ForecastQueryDto, GenerateForecastDto, UpdateForecastModelDto } from '../dto';
import { ForecastService } from '../services';

@Controller('forecast')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class ForecastController {
  constructor(private readonly forecasts: ForecastService) {}

  @Post('generate')
  @RequirePermissions(ReportsPermissionKeys.REPORTS_READ)
  async generate(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: GenerateForecastDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.forecasts.generate(tenant, dto);
    return { success: true, data };
  }

  @Get('summary')
  @RequirePermissions(ReportsPermissionKeys.REPORTS_READ)
  async summary(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ForecastQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.forecasts.getSummary(tenant, query);
    return { success: true, data };
  }

  @Get('inventory')
  @RequirePermissions(ReportsPermissionKeys.REPORTS_READ)
  async inventory(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ForecastQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.forecasts.getInventory(tenant, query);
    return { success: true, data };
  }

  @Get('staffing')
  @RequirePermissions(ReportsPermissionKeys.REPORTS_READ)
  async staffing(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ForecastQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.forecasts.getStaffing(tenant, query);
    return { success: true, data };
  }

  @Get('demand')
  @RequirePermissions(ReportsPermissionKeys.REPORTS_READ)
  async demand(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ForecastQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.forecasts.getDemand(tenant, query);
    return { success: true, data };
  }

  @Post('model/update')
  @RequirePermissions(ReportsPermissionKeys.REPORTS_CREATE)
  async updateModel(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateForecastModelDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.forecasts.updateModel(tenant, dto);
    return { success: true, data };
  }
}
