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
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../constants/admin-permission-keys';
import { OrdersAdminService } from '../services/orders-admin.service';
import { AdminListOrdersQueryDto, AdminUpdateOrderStatusDto } from '../dto';

@Controller('admin/orders')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.ORDERS)
export class AdminOrdersController {
  constructor(private readonly ordersAdminService: OrdersAdminService) {}

  @Get()
  async list(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AdminListOrdersQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.ordersAdminService.listOrders(tenant, {
      status: query.status,
      channel: query.channel,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      page: query.page,
      limit: query.limit,
    });
    return { success: true, data };
  }

  @Get(':orderId')
  async getOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.ordersAdminService.getOrderDetails(tenant, orderId);
    return { success: true, data };
  }

  @Patch(':orderId/status')
  async updateStatus(
    @CurrentTenant() tenant: TenantContext,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: AdminUpdateOrderStatusDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.ordersAdminService.updateOrderStatus(tenant, orderId, dto, user);
    return { success: true, data };
  }

  @Post(':orderId/resend-notifications')
  async resendNotifications(
    @CurrentTenant() tenant: TenantContext,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<ApiSuccessResponse<{ sent: boolean }>> {
    this.ordersAdminService.resendNotifications(tenant.tenantId, orderId);
    return { success: true, data: { sent: true } };
  }
}
