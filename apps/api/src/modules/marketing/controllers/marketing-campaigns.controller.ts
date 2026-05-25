import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { CreateMarketingCampaignDto, UpdateMarketingCampaignDto } from '../dto';
import { MarketingCampaignsService } from '../services';

@Controller('campaigns')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class MarketingCampaignsController {
  constructor(private readonly campaigns: MarketingCampaignsService) {}

  @Get('list')
  @RequirePermissions('marketing.read')
  async list(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.campaigns.list(tenant);
    return { success: true, data };
  }

  @Get('analytics')
  @RequirePermissions('marketing.read')
  async analytics(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.campaigns.analytics(tenant);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('marketing.read')
  async get(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.campaigns.get(tenant, id);
    return { success: true, data };
  }

  @Post('create')
  @RequirePermissions('marketing.write')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateMarketingCampaignDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.campaigns.create(tenant, dto);
    return { success: true, data };
  }

  @Post('update/:id')
  @RequirePermissions('marketing.write')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMarketingCampaignDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.campaigns.update(tenant, id, dto);
    return { success: true, data };
  }

  @Post('update')
  @RequirePermissions('marketing.write')
  async updateFromBody(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateMarketingCampaignDto & { id: string },
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.campaigns.update(tenant, dto.id, dto);
    return { success: true, data };
  }

  @Post('delete/:id')
  @RequirePermissions('marketing.write')
  async delete(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<{ deleted: boolean }>> {
    await this.campaigns.delete(tenant, id);
    return { success: true, data: { deleted: true } };
  }

  @Post('delete')
  @RequirePermissions('marketing.write')
  async deleteFromBody(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: { id: string },
  ): Promise<ApiSuccessResponse<{ deleted: boolean }>> {
    await this.campaigns.delete(tenant, dto.id);
    return { success: true, data: { deleted: true } };
  }

  @Post(':id/duplicate')
  @RequirePermissions('marketing.write')
  async duplicate(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.campaigns.duplicate(tenant, id);
    return { success: true, data };
  }

  @Post('send-now/:id')
  @RequirePermissions('marketing.write')
  async sendNow(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.campaigns.sendNow(tenant, id);
    return { success: true, data };
  }

  @Post('send-now')
  @RequirePermissions('marketing.write')
  async sendNowFromBody(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: { id: string },
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.campaigns.sendNow(tenant, dto.id);
    return { success: true, data };
  }

  @Post('process-scheduled')
  @RequirePermissions('marketing.write')
  async processScheduled(): Promise<ApiSuccessResponse<{ processed: number }>> {
    const processed = await this.campaigns.processScheduled();
    return { success: true, data: { processed } };
  }
}
