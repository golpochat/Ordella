import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import {
  CreateGiftCardDto,
  GiftCardAdjustDto,
  GiftCardDisableDto,
  GiftCardLookupDto,
  GiftCardRedeemDto,
} from '../dto';
import { GiftCardsService } from '../services';

@Controller('giftcards')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS)
export class GiftCardsController {
  constructor(private readonly giftCards: GiftCardsService) {}

  @Post('create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateGiftCardDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.giftCards.createGiftCard(tenant, dto);
    return { success: true, data };
  }

  @Post('redeem')
  async redeem(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: GiftCardRedeemDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.giftCards.redeemGiftCard(tenant, dto);
    return { success: true, data };
  }

  @Post('adjust')
  async adjust(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: GiftCardAdjustDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.giftCards.adjustGiftCard(tenant, dto);
    return { success: true, data };
  }

  @Post('status')
  async status(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: GiftCardDisableDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.giftCards.setGiftCardActive(tenant, dto);
    return { success: true, data };
  }

  @Get('lookup')
  async lookup(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: GiftCardLookupDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.giftCards.lookupGiftCard(tenant, query.code);
    return { success: true, data };
  }

  @Get('list')
  async list(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.giftCards.listGiftCards(tenant);
    return { success: true, data };
  }

  @Get('analytics')
  async analytics(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.giftCards.getAnalytics(tenant);
    return { success: true, data };
  }
}
