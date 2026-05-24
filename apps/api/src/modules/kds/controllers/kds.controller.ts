import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { KdsPermissionKeys } from '../constants/permission-keys';
import {
  FilterKdsOrdersDto,
  KdsItemActionDto,
  KdsOrderDetailResponseDto,
  KdsOrderSummaryResponseDto,
} from '../dto';
import { KdsOrderQueryService } from '../services/kds-order-query.service';
import { KdsUpdateService } from '../services/kds-update.service';

@Controller('kds')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class KdsController {
  constructor(
    private readonly orderQueryService: KdsOrderQueryService,
    private readonly updateService: KdsUpdateService,
  ) {}

  @Get('orders')
  @RequirePermissions(KdsPermissionKeys.KDS_READ)
  async getOrders(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterKdsOrdersDto,
  ): Promise<ApiSuccessResponse<KdsOrderSummaryResponseDto[]>> {
    const data = await this.orderQueryService.getActiveOrders(
      tenant.tenantId,
      query.station,
      query.status,
    );
    return { success: true, data };
  }

  @Get('orders/:orderId')
  @RequirePermissions(KdsPermissionKeys.KDS_READ)
  async getOrder(
    @CurrentTenant() tenant: TenantContext,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<ApiSuccessResponse<KdsOrderDetailResponseDto>> {
    const data = await this.orderQueryService.getOrderDetails(tenant.tenantId, orderId);
    return { success: true, data };
  }

  @Post('orders/:orderId/preparing')
  @RequirePermissions(KdsPermissionKeys.KDS_UPDATE)
  async markPreparing(
    @CurrentTenant() tenant: TenantContext,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<KdsOrderDetailResponseDto>> {
    const data = await this.updateService.markOrderPreparing(tenant, orderId, user);
    return { success: true, data };
  }

  @Post('orders/:orderId/ready')
  @RequirePermissions(KdsPermissionKeys.KDS_UPDATE)
  async markReady(
    @CurrentTenant() tenant: TenantContext,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<KdsOrderDetailResponseDto>> {
    const data = await this.updateService.markOrderReady(tenant, orderId, user);
    return { success: true, data };
  }

  @Post('orders/:orderId/items/:itemId/start')
  @RequirePermissions(KdsPermissionKeys.KDS_UPDATE)
  async markItemStart(
    @CurrentTenant() tenant: TenantContext,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: KdsItemActionDto,
  ): Promise<ApiSuccessResponse<KdsOrderDetailResponseDto>> {
    const data = await this.updateService.markItemStarted(tenant, orderId, itemId, dto);
    return { success: true, data };
  }

  @Post('orders/:orderId/items/:itemId/complete')
  @RequirePermissions(KdsPermissionKeys.KDS_UPDATE)
  async markItemComplete(
    @CurrentTenant() tenant: TenantContext,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: KdsItemActionDto,
  ): Promise<ApiSuccessResponse<KdsOrderDetailResponseDto>> {
    const data = await this.updateService.markItemCompleted(tenant, orderId, itemId, dto);
    return { success: true, data };
  }
}
