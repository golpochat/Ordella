import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import { ReceivePurchaseOrderDto, UpsertPurchaseOrderDto } from '../dto';
import { PurchaseOrdersService } from '../services';

@Controller('purchase-orders')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.INVENTORY)
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrders: PurchaseOrdersService) {}

  @Get('list')
  async list(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.purchaseOrders.list(tenant.tenantId);
    return { success: true, data };
  }

  @Get('analytics')
  async analytics(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.purchaseOrders.analytics(tenant.tenantId);
    return { success: true, data };
  }

  @Get('reorder-suggestions')
  async reorderSuggestions(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.purchaseOrders.reorderSuggestions(tenant.tenantId);
    return { success: true, data };
  }

  @Get(':id')
  async get(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.purchaseOrders.get(tenant.tenantId, id);
    return { success: true, data };
  }

  @Post('create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertPurchaseOrderDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.purchaseOrders.create(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertPurchaseOrderDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.purchaseOrders.update(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('receive')
  async receive(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: ReceivePurchaseOrderDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.purchaseOrders.receive(tenant.tenantId, dto);
    return { success: true, data };
  }
}
