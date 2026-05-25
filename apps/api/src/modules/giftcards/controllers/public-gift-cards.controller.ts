import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { GiftCardLookupDto, StoreCreditHistoryQueryDto } from '../dto';
import { GiftCardsService } from '../services';

@Controller('public/giftcards')
@UseGuards(TenantGuard)
export class PublicGiftCardsController {
  constructor(private readonly giftCards: GiftCardsService) {}

  @Get('lookup')
  async lookup(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: GiftCardLookupDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.giftCards.lookupGiftCard(tenant, query.code);
    return { success: true, data };
  }

  @Get('list')
  async list(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: StoreCreditHistoryQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.giftCards.listCustomerGiftCards(tenant, query.customerId);
    return { success: true, data };
  }
}

@Controller('public/storecredit')
@UseGuards(TenantGuard)
export class PublicStoreCreditController {
  constructor(private readonly giftCards: GiftCardsService) {}

  @Get('history')
  async history(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: StoreCreditHistoryQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.giftCards.listStoreCreditHistory(tenant, query.customerId);
    return { success: true, data };
  }
}
