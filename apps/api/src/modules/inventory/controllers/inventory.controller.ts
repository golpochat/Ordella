import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import { InventoryListQueryDto } from '../dto/inventory/inventory-list-query.dto';
import { UpdateInventoryItemDto } from '../dto/inventory/update-inventory-item.dto';
import { InventoryAdjustDto } from '../dto/inventory/inventory-adjust.dto';
import { InventoryBulkUpdateDto } from '../dto/inventory/inventory-bulk-update.dto';
import { InventoryManagementService } from '../services/inventory-management.service';

/** Retail inventory — per-location stock levels and adjustments */
@Controller('inventory')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.INVENTORY)
export class InventoryController {
  constructor(private readonly inventoryManagement: InventoryManagementService) {}

  @Get()
  async list(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: InventoryListQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.inventoryManagement.list(tenant.tenantId, query);
    return { success: true, data };
  }

  @Get('low-stock')
  async lowStock(
    @CurrentTenant() tenant: TenantContext,
    @Query('locationId') locationId?: string,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.inventoryManagement.listLowStock(tenant.tenantId, locationId);
    return { success: true, data };
  }

  @Get('summary')
  async summary(
    @CurrentTenant() tenant: TenantContext,
    @Query('locationId') locationId?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.inventoryManagement.getSummary(tenant.tenantId, locationId);
    return { success: true, data };
  }

  @Post('update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateInventoryItemDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.inventoryManagement.updateItem(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('adjust')
  async adjust(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: InventoryAdjustDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.inventoryManagement.adjust(tenant.tenantId, dto, user);
    return { success: true, data };
  }

  @Post('bulk-update')
  async bulkUpdate(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: InventoryBulkUpdateDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.inventoryManagement.bulkUpdate(tenant.tenantId, dto);
    return { success: true, data };
  }
}
