import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import {
  ApproveAppDto,
  CreateReviewDto,
  InstallAppDto,
  MarketplaceQueryDto,
  MeterUsageDto,
  RegisterPartnerDto,
  SubmitAppDto,
  SubmitVersionDto,
} from '../dto';
import { AppStoreService } from '../services/app-store.service';

@Controller('app-store')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class AppStoreController {
  constructor(private readonly appStore: AppStoreService) {}

  @Get('apps')
  @RequirePermissions('app-store.read')
  async marketplace(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: MarketplaceQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.appStore.marketplace(tenant, query);
    return { success: true, data };
  }

  @Get('apps/:id')
  @RequirePermissions('app-store.read')
  async details(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.appStore.appDetails(tenant, id);
    return { success: true, data };
  }

  @Post('partners/register')
  @RequirePermissions('app-store.partner')
  async registerPartner(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterPartnerDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.appStore.registerPartner(tenant, dto, user);
    return { success: true, data };
  }

  @Post('apps/submit')
  @RequirePermissions('app-store.partner')
  async submitApp(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitAppDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.appStore.submitApp(tenant, dto, user);
    return { success: true, data };
  }

  @Patch('apps/:id/approval')
  @RequirePermissions('app-store.approve')
  async approveApp(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveAppDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.appStore.approveApp(tenant, id, dto, user);
    return { success: true, data };
  }

  @Post('apps/:id/versions')
  @RequirePermissions('app-store.partner')
  async submitVersion(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitVersionDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.appStore.submitVersion(tenant, id, dto, user);
    return { success: true, data };
  }

  @Post('apps/:id/install')
  @RequirePermissions('app-store.install')
  async install(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: InstallAppDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.appStore.install(tenant, id, dto, user);
    return { success: true, data };
  }

  @Delete('installations/:id')
  @RequirePermissions('app-store.install')
  async uninstall(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.appStore.uninstall(tenant, id, user);
    return { success: true, data: null };
  }

  @Post('apps/:id/reviews')
  @RequirePermissions('app-store.review')
  async review(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.appStore.review(tenant, id, dto, user);
    return { success: true, data };
  }

  @Post('installations/:id/usage')
  @RequirePermissions('app-store.billing')
  async meterUsage(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MeterUsageDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.appStore.meterUsage(tenant, id, dto, user);
    return { success: true, data };
  }

  @Get('analytics')
  @RequirePermissions('app-store.analytics')
  async analytics(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.appStore.analytics(tenant);
    return { success: true, data };
  }

  @Get('partner-dashboard')
  @RequirePermissions('app-store.partner')
  async partnerDashboard(
    @CurrentTenant() tenant: TenantContext,
    @Query('partnerId') partnerId?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.appStore.partnerDashboard(tenant, partnerId);
    return { success: true, data };
  }
}
