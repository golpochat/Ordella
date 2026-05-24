import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { CreateOnlineOrderDto } from '../../orders/dto/orders/create-online-order.dto';
import { OrderResponseDto } from '../../orders/dto';
import { OnlineOrderService } from '../services/online-order.service';

/** POST /orders/create-online — public storefront checkout */
@Controller('orders')
@UseGuards(TenantGuard)
export class OrdersOnlinePublicController {
  constructor(private readonly onlineOrderService: OnlineOrderService) {}

  @Post('create-online')
  async createOnline(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateOnlineOrderDto,
  ): Promise<ApiSuccessResponse<OrderResponseDto>> {
    const data = await this.onlineOrderService.createOnlineOrder(tenant, dto);
    return { success: true, data };
  }
}
