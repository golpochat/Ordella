import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdjustStockDto } from '../../inventory/dto/inventory/adjust-stock.dto';
import { AdminPermissionKeys } from '../constants/admin-permission-keys';
import { InventoryAdminService } from '../services/inventory-admin.service';
import { AdminCreateAdjustmentDto, AdminMovementsQueryDto, AdminStockQueryDto } from '../dto';

@Controller('admin/inventory')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.INVENTORY)
export class AdminInventoryController {
  constructor(private readonly inventoryAdminService: InventoryAdminService) {}

  @Get('stock')
  async listStock(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AdminStockQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.inventoryAdminService.listStockLevels(tenant.tenantId, query);
    return { success: true, data };
  }

  @Get('movements')
  async listMovements(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AdminMovementsQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.inventoryAdminService.listMovements(tenant.tenantId, {
      ...query,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });
    return { success: true, data };
  }

  @Post('adjust')
  async adjust(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: AdjustStockDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.inventoryAdminService.adjustStock(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('adjustments')
  async createAdjustment(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: AdminCreateAdjustmentDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.inventoryAdminService.createAdjustment(tenant.tenantId, dto);
    return { success: true, data };
  }
}
