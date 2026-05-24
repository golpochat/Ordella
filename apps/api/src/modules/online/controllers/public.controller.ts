import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import {
  CreateOnlineBasketDto,
  OnlineBasketResponseDto,
  OnlineCheckoutDto,
  OnlineCheckoutResponseDto,
  OnlinePaymentDto,
  OnlinePaymentResponseDto,
  OnlineOrderStatusResponseDto,
  PatchOnlineBasketItemsDto,
  PublicMenuQueryDto,
} from '../dto';
import { MenuQueryService } from '../services/menu-query.service';
import { OnlineBasketFacade } from '../services/online-basket.facade';
import { CheckoutService } from '../services/checkout.service';
import { OnlineOrderService } from '../services/online-order.service';
import { OnlinePublicMenuView, OnlineProductView } from '../types';

@Controller('public')
@UseGuards(TenantGuard)
export class PublicController {
  constructor(
    private readonly menuQueryService: MenuQueryService,
    private readonly basketFacade: OnlineBasketFacade,
    private readonly checkoutService: CheckoutService,
    private readonly onlineOrderService: OnlineOrderService,
  ) {}

  @Get('menu')
  async getMenu(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: PublicMenuQueryDto,
  ): Promise<ApiSuccessResponse<OnlinePublicMenuView>> {
    const data = await this.menuQueryService.getPublicMenu(tenant.tenantId, query.locationId);
    return { success: true, data };
  }

  @Get('menu/:categoryId')
  async getMenuByCategory(
    @CurrentTenant() tenant: TenantContext,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Query() query: PublicMenuQueryDto,
  ): Promise<ApiSuccessResponse<OnlineProductView[]>> {
    const data = await this.menuQueryService.getProductsForCategory(
      tenant.tenantId,
      query.locationId,
      categoryId,
    );
    return { success: true, data };
  }

  @Post('basket')
  async createBasket(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateOnlineBasketDto,
  ): Promise<ApiSuccessResponse<OnlineBasketResponseDto>> {
    const data = this.basketFacade.createOrAddItem(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Patch('basket/items')
  async patchBasketItems(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: PatchOnlineBasketItemsDto,
  ): Promise<ApiSuccessResponse<OnlineBasketResponseDto>> {
    const data = this.basketFacade.patchItems(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('checkout')
  async checkout(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: OnlineCheckoutDto,
  ): Promise<ApiSuccessResponse<OnlineCheckoutResponseDto>> {
    const data = await this.checkoutService.checkout(tenant, dto);
    return { success: true, data };
  }

  @Post('payment')
  async payment(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: OnlinePaymentDto,
  ): Promise<ApiSuccessResponse<OnlinePaymentResponseDto>> {
    const data = await this.onlineOrderService.placeOrder(tenant, dto);
    return { success: true, data };
  }

  @Get('order-status/:orderId')
  async orderStatus(
    @CurrentTenant() tenant: TenantContext,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<ApiSuccessResponse<OnlineOrderStatusResponseDto>> {
    const data = await this.onlineOrderService.getOrderStatus(tenant, orderId);
    return { success: true, data };
  }
}
