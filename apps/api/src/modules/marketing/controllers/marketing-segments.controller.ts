import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { CreateMarketingSegmentDto, UpdateMarketingSegmentDto } from '../dto';
import { MarketingSegmentsService } from '../services';

@Controller('segments')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class MarketingSegmentsController {
  constructor(private readonly segments: MarketingSegmentsService) {}

  @Get('list')
  @RequirePermissions('marketing.read')
  async list(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.segments.list(tenant);
    return { success: true, data };
  }

  @Post('create')
  @RequirePermissions('marketing.write')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateMarketingSegmentDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.segments.create(tenant, dto);
    return { success: true, data };
  }

  @Post('update/:id')
  @RequirePermissions('marketing.write')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMarketingSegmentDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.segments.update(tenant, id, dto);
    return { success: true, data };
  }

  @Post('update')
  @RequirePermissions('marketing.write')
  async updateFromBody(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateMarketingSegmentDto & { id: string },
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.segments.update(tenant, dto.id, dto);
    return { success: true, data };
  }

  @Post(':id/preview')
  @RequirePermissions('marketing.read')
  async preview(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.segments.preview(tenant, id);
    return { success: true, data };
  }

  @Post('delete/:id')
  @Delete(':id')
  @RequirePermissions('marketing.write')
  async delete(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<{ deleted: boolean }>> {
    await this.segments.delete(tenant, id);
    return { success: true, data: { deleted: true } };
  }

  @Post('delete')
  @RequirePermissions('marketing.write')
  async deleteFromBody(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: { id: string },
  ): Promise<ApiSuccessResponse<{ deleted: boolean }>> {
    await this.segments.delete(tenant, dto.id);
    return { success: true, data: { deleted: true } };
  }
}
