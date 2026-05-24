import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { KdsPermissionKeys } from '../constants/permission-keys';
import { AcknowledgeOrderDto } from '../dto/acknowledge-order.dto';
import { FulfillmentFeedQueryDto } from '../dto/fulfillment-feed-query.dto';
import { UpdateFulfillmentStatusDto } from '../dto/update-fulfillment-status.dto';
import { KdsOrderDetailView, KdsOrderSummaryView } from '../types/kds-order.views';
import { FulfillmentFeedService, FulfillmentStatusService } from '../services';

/** FDS routes — /orders/fulfillment-feed, update-status, acknowledge */
@Controller('orders')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class OrdersFulfillmentController {
  constructor(
    private readonly feedService: FulfillmentFeedService,
    private readonly fulfillmentStatus: FulfillmentStatusService,
  ) {}

  @Get('fulfillment-feed')
  @RequirePermissions(KdsPermissionKeys.KDS_READ)
  async fulfillmentFeed(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FulfillmentFeedQueryDto,
  ): Promise<ApiSuccessResponse<KdsOrderSummaryView[]>> {
    const data = await this.feedService.getFeed(
      tenant.tenantId,
      query.locationId,
      query.includeCompleted,
    );
    return { success: true, data };
  }

  @Post('update-status')
  @RequirePermissions(KdsPermissionKeys.KDS_UPDATE)
  async updateStatus(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateFulfillmentStatusDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<KdsOrderDetailView>> {
    const data = await this.fulfillmentStatus.updateStatus(tenant, dto, user);
    return { success: true, data };
  }

  @Post('acknowledge')
  @RequirePermissions(KdsPermissionKeys.KDS_UPDATE)
  async acknowledge(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: AcknowledgeOrderDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<KdsOrderDetailView>> {
    const data = await this.fulfillmentStatus.acknowledgeWithLocationSettings(
      tenant,
      dto,
      user,
    );
    return { success: true, data };
  }
}
