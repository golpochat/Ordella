import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { CustomerSearchDto, LoyaltyRedeemQuoteDto } from '../dto';
import { LoyaltyService } from '../services';

@Controller('public/loyalty')
@UseGuards(TenantGuard)
export class PublicLoyaltyController {
  constructor(private readonly loyalty: LoyaltyService) {}

  @Get('settings')
  async settings(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.loyalty.getSettings(tenant.tenantId);
    return { success: true, data };
  }

  @Get('customer')
  async customer(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: CustomerSearchDto,
  ): Promise<ApiSuccessResponse<unknown | null>> {
    const [data = null] = await this.loyalty.searchCustomers(tenant, query);
    return { success: true, data };
  }

  @Post('redeem/quote')
  async quote(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: LoyaltyRedeemQuoteDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.loyalty.quoteRedemption(tenant.tenantId, dto);
    return { success: true, data };
  }
}
