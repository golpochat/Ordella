import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { KdsBroadcastService } from '../../kds/services/kds-broadcast.service';
import { KdsOrderQueryService } from '../../kds/services/kds-order-query.service';
import { CreateOrderDto, OrderResponseDto } from '../dto';
import { PosCreateOrderDto } from '../dto/orders/pos-create-order.dto';
import { RouteToFulfillmentDto } from '../dto/orders/route-to-fulfillment.dto';
import { OrdersService } from '../services';

/** POS-friendly order routes — registered before :id param routes */
@Controller('orders')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class OrdersPosController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly kdsOrderQuery: KdsOrderQueryService,
    private readonly kdsBroadcast: KdsBroadcastService,
  ) {}

  @Post('create')
  @RequirePermissions('orders:create')
  async posCreate(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: PosCreateOrderDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<OrderResponseDto>> {
    const createDto: CreateOrderDto = {
      locationId: dto.locationId,
      orderType: dto.orderType,
      items: dto.items.map((item) => ({
        productId: item.itemId,
        variantId: item.variantId,
        quantity: item.quantity,
        modifierOptionIds: item.modifiers,
      })),
    };
    const data = await this.ordersService.create(tenant, createDto, user);
    return { success: true, data };
  }

  @Post('route-to-fulfillment')
  @RequirePermissions('orders:create')
  async routeToFulfillment(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: RouteToFulfillmentDto,
  ): Promise<ApiSuccessResponse<null>> {
    const detail = await this.kdsOrderQuery.getOrderDetails(tenant.tenantId, dto.orderId);
    this.kdsBroadcast.orderCreated(tenant.tenantId, detail);
    return { success: true, data: null };
  }
}
