import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import { UpsertSupplierDto } from '../dto';
import { SuppliersService } from '../services';

@Controller('suppliers')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.INVENTORY)
export class SuppliersController {
  constructor(private readonly suppliers: SuppliersService) {}

  @Get('list')
  async list(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.suppliers.list(tenant.tenantId);
    return { success: true, data };
  }

  @Get(':id')
  async get(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.suppliers.get(tenant.tenantId, id);
    return { success: true, data };
  }

  @Post('create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertSupplierDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.suppliers.create(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertSupplierDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.suppliers.update(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post(':id/disable')
  async disable(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.suppliers.disable(tenant.tenantId, id);
    return { success: true, data };
  }
}
