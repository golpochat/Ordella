import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import {
  CustomerSearchDto,
  LoyaltyAdjustmentDto,
  LoyaltyRedeemQuoteDto,
  LoyaltyTransactionQueryDto,
  UpdateLoyaltySettingsDto,
  UpsertCustomerDto,
} from '../dto';
import { LoyaltyService } from '../services/loyalty.service';

@Controller('loyalty')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS)
export class LoyaltyController {
  constructor(private readonly loyalty: LoyaltyService) {}

  @Get('settings')
  async settings(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.loyalty.getSettings(tenant.tenantId);
    return { success: true, data };
  }

  @Post('settings')
  async updateSettings(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateLoyaltySettingsDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.loyalty.updateSettings(tenant, dto);
    return { success: true, data };
  }

  @Get('customers')
  async customers(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: CustomerSearchDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.loyalty.searchCustomers(tenant, query);
    return { success: true, data };
  }

  @Post('customers')
  async upsertCustomer(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertCustomerDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.loyalty.upsertCustomer(tenant, dto);
    return { success: true, data };
  }

  @Get('customers/:id')
  async customer(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.loyalty.getCustomerProfile(tenant, id);
    return { success: true, data };
  }

  @Get('customers/:id/orders')
  async customerOrders(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.loyalty.getCustomerOrders(tenant, id);
    return { success: true, data };
  }

  @Post('adjust')
  async adjust(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: LoyaltyAdjustmentDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.loyalty.adjustPoints(tenant, dto);
    return { success: true, data };
  }

  @Post('redeem/quote')
  async quoteRedeem(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: LoyaltyRedeemQuoteDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.loyalty.quoteRedemption(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Get('transactions')
  async transactions(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: LoyaltyTransactionQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.loyalty.listTransactions(tenant, query);
    return { success: true, data };
  }

  @Get('analytics')
  async analytics(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.loyalty.getAnalytics(tenant);
    return { success: true, data };
  }
}
