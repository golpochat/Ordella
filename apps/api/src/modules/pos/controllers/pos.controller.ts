import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { PosPermissionKeys } from '../constants/permission-keys';
import {
  CreatePosCartDto,
  PatchPosCartItemsDto,
  PosCartResponseDto,
  PosCheckoutDto,
  PosCheckoutResponseDto,
  PosPaymentDto,
  PosPaymentResponseDto,
  PosReceiptResponseDto,
} from '../dto';
import { PosCartFacade } from '../services/pos-cart.facade';
import { PosOrderService } from '../services/pos-order.service';

@Controller('pos')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class PosController {
  constructor(
    private readonly posCartFacade: PosCartFacade,
    private readonly posOrderService: PosOrderService,
  ) {}

  @Post('cart')
  @RequirePermissions(PosPermissionKeys.POS_CART)
  async createCart(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreatePosCartDto,
  ): Promise<ApiSuccessResponse<PosCartResponseDto>> {
    const data = this.posCartFacade.createOrAddItem(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Patch('cart/items')
  @RequirePermissions(PosPermissionKeys.POS_CART)
  async patchCartItems(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: PatchPosCartItemsDto,
  ): Promise<ApiSuccessResponse<PosCartResponseDto>> {
    const data = this.posCartFacade.patchItems(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('checkout')
  @RequirePermissions(PosPermissionKeys.POS_CHECKOUT)
  async checkout(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: PosCheckoutDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<PosCheckoutResponseDto>> {
    const data = await this.posOrderService.checkout(tenant, dto, user);
    return { success: true, data };
  }

  @Post('payment')
  @RequirePermissions(PosPermissionKeys.POS_PAYMENT)
  async payment(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: PosPaymentDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<PosPaymentResponseDto>> {
    const data = await this.posOrderService.pay(tenant, dto, user);
    return { success: true, data };
  }

  @Get('receipt/:orderId')
  @RequirePermissions(PosPermissionKeys.POS_RECEIPT)
  async receipt(
    @CurrentTenant() tenant: TenantContext,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<ApiSuccessResponse<PosReceiptResponseDto>> {
    const data = await this.posOrderService.getReceipt(tenant, orderId);
    return { success: true, data };
  }
}
