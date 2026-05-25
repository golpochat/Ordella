import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, Public, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import { PosPermissionKeys } from '../../pos/constants/permission-keys';
import { RecommendationEventDto, RecommendationQueryDto, RecommendationSettingsDto } from '../dto';
import { RecommendationsService } from '../services';

function parseItemIds(raw?: string): string[] {
  return (raw ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendations: RecommendationsService) {}

  @Public()
  @UseGuards(TenantGuard)
  @Get('item/:itemId')
  async item(
    @CurrentTenant() tenant: TenantContext,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Query() query: RecommendationQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.recommendations.forItem(tenant.tenantId, itemId, {
      customerId: query.customerId,
      locationId: query.locationId,
      limit: query.limit,
      channel: 'online',
    });
    return { success: true, data };
  }

  @Public()
  @UseGuards(TenantGuard)
  @Get('customer/:customerId')
  async customer(
    @CurrentTenant() tenant: TenantContext,
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Query() query: RecommendationQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.recommendations.forCustomer(tenant.tenantId, customerId, {
      itemIds: parseItemIds(query.itemIds),
      locationId: query.locationId,
      limit: query.limit,
      channel: 'online',
    });
    return { success: true, data };
  }

  @Public()
  @UseGuards(TenantGuard)
  @Get('cart')
  async cart(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: RecommendationQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.recommendations.forCart(tenant.tenantId, {
      itemIds: parseItemIds(query.itemIds),
      customerId: query.customerId,
      locationId: query.locationId,
      limit: query.limit,
      channel: 'online',
    });
    return { success: true, data };
  }

  @Public()
  @UseGuards(TenantGuard)
  @Post('events')
  async event(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: RecommendationEventDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.recommendations.recordEvent(tenant.tenantId, dto);
    return { success: true, data };
  }

  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(PosPermissionKeys.POS_CATALOG)
  @Get('pos/cart')
  async posCart(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: RecommendationQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.recommendations.forCart(tenant.tenantId, {
      itemIds: parseItemIds(query.itemIds),
      customerId: query.customerId,
      locationId: query.locationId,
      limit: query.limit,
      channel: 'pos',
    });
    return { success: true, data };
  }

  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.REPORTS)
  @Get('analytics')
  async analytics(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.recommendations.analytics(tenant.tenantId);
    return { success: true, data };
  }

  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  @Get('settings')
  async settings(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.recommendations.getSettings(tenant.tenantId);
    return { success: true, data };
  }

  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  @Post('settings')
  async updateSettings(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: RecommendationSettingsDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.recommendations.updateSettings(tenant.tenantId, dto);
    return { success: true, data };
  }
}
