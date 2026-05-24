import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../constants/admin-permission-keys';
import { AnalyticsAdminService } from '../services/analytics-admin.service';
import { AdminAnalyticsQueryDto } from '../dto/admin-analytics-query.dto';

@Controller('analytics')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.REPORTS)
export class AdminAnalyticsController {
  constructor(private readonly analyticsAdminService: AnalyticsAdminService) {}

  @Get('overview')
  async overview(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AdminAnalyticsQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.analyticsAdminService.getOverview(tenant.tenantId, query);
    return { success: true, data };
  }

  @Get('revenue-by-day')
  async revenueByDay(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AdminAnalyticsQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.analyticsAdminService.getRevenueByDay(tenant.tenantId, query);
    return { success: true, data };
  }

  @Get('orders-by-day')
  async ordersByDay(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AdminAnalyticsQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.analyticsAdminService.getOrdersByDay(tenant.tenantId, query);
    return { success: true, data };
  }

  @Get('sales-by-channel')
  async salesByChannel(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AdminAnalyticsQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.analyticsAdminService.getSalesByChannel(tenant.tenantId, query);
    return { success: true, data };
  }

  @Get('sales-by-location')
  async salesByLocation(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AdminAnalyticsQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.analyticsAdminService.getSalesByLocation(tenant.tenantId, query);
    return { success: true, data };
  }

  @Get('top-items')
  async topItems(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AdminAnalyticsQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.analyticsAdminService.getTopItems(tenant.tenantId, query);
    return { success: true, data };
  }

  @Get('category-performance')
  async categoryPerformance(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AdminAnalyticsQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.analyticsAdminService.getCategoryPerformance(tenant.tenantId, query);
    return { success: true, data };
  }

  @Get('low-inventory')
  async lowInventory(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AdminAnalyticsQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.analyticsAdminService.getLowInventory(tenant.tenantId, query);
    return { success: true, data };
  }

  @Get('locations')
  async locations(
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<{ id: string; name: string }[]>> {
    const data = await this.analyticsAdminService.listLocations(tenant.tenantId);
    return { success: true, data };
  }

  @Get('recent-orders')
  async recentOrders(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AdminAnalyticsQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.analyticsAdminService.getRecentOrders(tenant.tenantId, query);
    return { success: true, data };
  }
}
