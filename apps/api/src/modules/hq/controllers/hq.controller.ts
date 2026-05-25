import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import { CreateFranchiseeDto, HqQueryDto } from '../dto';
import { HqService } from '../services/hq.service';

@Controller('hq')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.FRANCHISE_HQ)
export class HqController {
  constructor(private readonly hqService: HqService) {}

  @Get('analytics/overview')
  async overview(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hqService.overview(tenant, user);
    return { success: true, data };
  }

  @Get('analytics/locations')
  async analyticsLocations(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.hqService.locationsView(tenant, user);
    return { success: true, data };
  }

  @Get('analytics/categories')
  async categories(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.hqService.categories(tenant, user);
    return { success: true, data };
  }

  @Get('analytics/customers')
  async customers(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.hqService.customersView(tenant, user);
    return { success: true, data };
  }

  @Get('analytics/inventory')
  async analyticsInventory(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: HqQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.hqService.inventoryView(tenant, query, user);
    return { success: true, data };
  }

  @Get('locations')
  async locations(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.hqService.locationsView(tenant, user);
    return { success: true, data };
  }

  @Get('orders')
  async orders(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: HqQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hqService.ordersView(tenant, query, user);
    return { success: true, data };
  }

  @Get('inventory')
  async inventory(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: HqQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.hqService.inventoryView(tenant, query, user);
    return { success: true, data };
  }

  @Get('staff')
  async staff(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: HqQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hqService.staffView(tenant, query, user);
    return { success: true, data };
  }

  @Get('procurement/suppliers')
  async supplierPerformance(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hqService.supplierPerformance(tenant, user);
    return { success: true, data };
  }

  @Get('procurement/purchase-orders')
  async purchaseOrders(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: HqQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hqService.purchaseOrdersView(tenant, query, user);
    return { success: true, data };
  }

  @Get('warehouse/performance')
  async warehousePerformance(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hqService.warehousePerformance(tenant, user);
    return { success: true, data };
  }

  @Get('warehouse/transfers')
  async warehouseTransfers(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: HqQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hqService.transfersView(tenant, query, user);
    return { success: true, data };
  }

  @Post('franchisee/create')
  async createFranchisee(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateFranchiseeDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.hqService.createFranchisee(tenant, dto, user);
    return { success: true, data };
  }
}
