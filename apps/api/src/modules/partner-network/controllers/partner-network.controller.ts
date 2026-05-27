import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import {
  ApprovePartnerApplicationDto,
  CreatePartnerPortalUserDto,
  CreateMarketplaceItemDto,
  MarketplaceQueryDto,
  RevenueShareQueryDto,
  SubmitCommissionPayoutDto,
} from '../dto';
import { PartnerNetworkService } from '../services/partner-network.service';

import { LinkClientTenantDto } from '../dto/partner-network.dto';

@Controller('partner-network')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class PartnerNetworkController {
  constructor(private readonly network: PartnerNetworkService) {}

  @Get('applications')
  @RequirePermissions('partner-network.read')
  async applications(
    @CurrentTenant() tenant: TenantContext,
    @Query('status') status?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.network.listPartnerApplications(tenant, status ? { status } : undefined);
    return { success: true, data };
  }

  @Post('applications/:id/approve')
  @RequirePermissions('partner-network.approve')
  async approve(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApprovePartnerApplicationDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.network.approveApplication(tenant, user, id, dto);
    return { success: true, data };
  }

  @Get('marketplace/categories')
  @RequirePermissions('partner-network.marketplace')
  async categories(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.network.listMarketplaceCategories(tenant);
    return { success: true, data };
  }

  @Get('marketplace/items')
  @RequirePermissions('partner-network.marketplace')
  async items(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: MarketplaceQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.network.listMarketplaceItems(tenant, null, query);
    return { success: true, data };
  }

  @Post('marketplace/items')
  @RequirePermissions('partner-network.marketplace')
  async createItem(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMarketplaceItemDto & { partnerId: string },
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.network.createMarketplaceItem(tenant, user, dto, dto.partnerId);
    return { success: true, data };
  }

  @Get('analytics/partners/:partnerId')
  @RequirePermissions('partner-network.analytics')
  async analytics(@CurrentTenant() tenant: TenantContext, @Param('partnerId', ParseUUIDPipe) partnerId: string) {
    const data = await this.network.partnerAnalytics(tenant, partnerId);
    return { success: true, data };
  }

  @Post('commissions/generate')
  @RequirePermissions('partner-network.revenue')
  async generateCommissions(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: RevenueShareQueryDto & { partnerId?: string },
  ) {
    const data = await this.network.generatePartnerCommissionRecords(tenant, query.partnerId ?? '', {
      periodStart: query.periodStart,
      periodEnd: query.periodEnd,
    });
    return { success: true, data };
  }

  @Post('payouts/create')
  @RequirePermissions('partner-network.revenue')
  async createPayout(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: SubmitCommissionPayoutDto & { partnerId?: string },
  ) {
    const data = await this.network.createPayoutReport(tenant, query.partnerId ?? '', query);
    return { success: true, data };
  }

  @Post('partners/:partnerId/users')
  @RequirePermissions('partner-network.manage')
  async createPartnerUser(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('partnerId', ParseUUIDPipe) partnerId: string,
    @Body() dto: CreatePartnerPortalUserDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.network.createPartnerPortalUser(tenant, user, partnerId, dto);
    return { success: true, data };
  }
}

