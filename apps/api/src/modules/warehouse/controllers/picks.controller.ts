import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { CompletePickTaskDto, UpdatePickTaskDto } from '../dto';
import { WarehouseService } from '../services';

@Controller('picks')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.INVENTORY)
export class PicksController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get('list')
  async list(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.warehouseService.listPicks(tenant);
    return { success: true, data };
  }

  @Post('update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdatePickTaskDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.warehouseService.updatePick(tenant, dto);
    return { success: true, data };
  }

  @Post('complete')
  async complete(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CompletePickTaskDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.warehouseService.completePick(tenant, dto);
    return { success: true, data };
  }
}
