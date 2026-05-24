import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../constants/admin-permission-keys';
import { ReportsAdminService } from '../services/reports-admin.service';
import { AdminReportsQueryDto } from '../dto';

@Controller('admin/reports')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.REPORTS)
export class AdminReportsController {
  constructor(private readonly reportsAdminService: ReportsAdminService) {}

  @Get('sales')
  async sales(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AdminReportsQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.reportsAdminService.getDailySales(tenant.tenantId, query);
    return { success: true, data };
  }

  @Get('inventory')
  async inventory(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AdminReportsQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.reportsAdminService.getInventoryMovements(tenant.tenantId, query);
    return { success: true, data };
  }

  @Get('delivery')
  async delivery(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AdminReportsQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.reportsAdminService.getDeliveryPerformance(tenant.tenantId, query);
    return { success: true, data };
  }

  @Get('promotions')
  async promotions(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AdminReportsQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.reportsAdminService.getPromotionUsage(tenant.tenantId, query);
    return { success: true, data };
  }
}
