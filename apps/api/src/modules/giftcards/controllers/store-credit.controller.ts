import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import {
  StoreCreditDeductDto,
  StoreCreditHistoryQueryDto,
  StoreCreditMutationDto,
} from '../dto';
import { GiftCardsService } from '../services';

@Controller('storecredit')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS)
export class StoreCreditController {
  constructor(private readonly giftCards: GiftCardsService) {}

  @Post('add')
  async add(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: StoreCreditMutationDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.giftCards.addStoreCredit(tenant, dto);
    return { success: true, data };
  }

  @Post('deduct')
  async deduct(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: StoreCreditDeductDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.giftCards.deductStoreCredit(tenant, dto);
    return { success: true, data };
  }

  @Get('history')
  async history(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: StoreCreditHistoryQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.giftCards.listStoreCreditHistory(tenant, query.customerId);
    return { success: true, data };
  }
}
