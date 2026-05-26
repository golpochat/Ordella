import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AssignWarehouseBinItemDto, MoveWarehouseBinItemDto, UpsertWarehouseBinDto, UpsertWarehouseZoneDto } from '../dto';
import { WarehouseService } from '../services';

@Controller('warehouse')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.INVENTORY)
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get('dashboard')
  async dashboard(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.warehouseService.dashboard(tenant);
    return { success: true, data };
  }

  @Get('zones')
  async zones(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.warehouseService.listZones(tenant);
    return { success: true, data };
  }

  @Post('zones/create')
  async createZone(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertWarehouseZoneDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.warehouseService.upsertZone(tenant, dto);
    return { success: true, data };
  }

  @Post('zones/update')
  async updateZone(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertWarehouseZoneDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.warehouseService.upsertZone(tenant, dto);
    return { success: true, data };
  }

  @Get('bins')
  async bins(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.warehouseService.listBins(tenant);
    return { success: true, data };
  }

  @Post('bins/create')
  async createBin(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertWarehouseBinDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.warehouseService.upsertBin(tenant, dto);
    return { success: true, data };
  }

  @Post('bins/move-item')
  async moveItem(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: MoveWarehouseBinItemDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.warehouseService.moveItem(tenant, dto);
    return { success: true, data };
  }

  @Post('bins/assign-item')
  async assignItem(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: AssignWarehouseBinItemDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.warehouseService.assignItem(tenant, dto);
    return { success: true, data };
  }
}
