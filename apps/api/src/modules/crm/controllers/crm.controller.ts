import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { CrmCustomerQueryDto, TagCustomerDto, UpdateCustomerInsightsDto } from '../dto';
import { CrmCustomersService } from '../services';

@Controller('crm')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class CrmController {
  constructor(private readonly crm: CrmCustomersService) {}

  @Get('customers')
  @RequirePermissions('crm.read')
  async customers(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: CrmCustomerQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.crm.listCustomers(tenant, query);
    return { success: true, data };
  }

  @Get('customers/:id')
  @RequirePermissions('crm.read')
  async customer(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.crm.getCustomer(tenant, id);
    return { success: true, data };
  }

  @Get('segments')
  @RequirePermissions('crm.read')
  async segments(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.crm.segments(tenant);
    return { success: true, data };
  }

  @Post('customers/tag')
  @RequirePermissions('crm.write')
  async tagCustomer(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: TagCustomerDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.crm.tagCustomer(tenant, dto);
    return { success: true, data };
  }

  @Post('customers/update-insights')
  @RequirePermissions('crm.write')
  async updateInsights(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateCustomerInsightsDto,
  ): Promise<ApiSuccessResponse<{ updated: number }>> {
    const data = await this.crm.refreshInsights(tenant, dto.customerId);
    return { success: true, data };
  }

  @Get('insights')
  @RequirePermissions('crm.read')
  async insights(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.crm.insightsDashboard(tenant);
    return { success: true, data };
  }
}
