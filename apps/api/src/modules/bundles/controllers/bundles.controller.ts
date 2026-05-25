import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { CreateBundleDto, UpdateBundleDto } from '../dto';
import { BundlesService } from '../services';

@Controller('bundles')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class BundlesController {
  constructor(private readonly bundles: BundlesService) {}

  @Get('list')
  @RequirePermissions('products:read')
  async list(
    @CurrentTenant() tenant: TenantContext,
    @Query('locationId') locationId?: string,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.bundles.list(tenant, locationId);
    return { success: true, data };
  }

  @Get('analytics')
  @RequirePermissions('products:read')
  async analytics(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.bundles.analytics(tenant);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('products:read')
  async get(@CurrentTenant() tenant: TenantContext, @Param('id') id: string): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.bundles.get(tenant, id);
    return { success: true, data };
  }

  @Post('create')
  @RequirePermissions('products:create')
  async create(@CurrentTenant() tenant: TenantContext, @Body() dto: CreateBundleDto): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.bundles.create(tenant, dto);
    return { success: true, data };
  }

  @Post('update')
  @RequirePermissions('products:update')
  async update(@CurrentTenant() tenant: TenantContext, @Body() dto: UpdateBundleDto): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.bundles.update(tenant, dto);
    return { success: true, data };
  }

  @Post(':id/duplicate')
  @RequirePermissions('products:create')
  async duplicate(@CurrentTenant() tenant: TenantContext, @Param('id') id: string): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.bundles.duplicate(tenant, id);
    return { success: true, data };
  }

  @Post(':id/disable')
  @RequirePermissions('products:update')
  async disable(@CurrentTenant() tenant: TenantContext, @Param('id') id: string): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.bundles.disable(tenant, id);
    return { success: true, data };
  }

  @Post('delete')
  @RequirePermissions('products:delete')
  async delete(@CurrentTenant() tenant: TenantContext, @Body() dto: { id: string }): Promise<ApiSuccessResponse<{ deleted: boolean }>> {
    await this.bundles.delete(tenant, dto.id);
    return { success: true, data: { deleted: true } };
  }
}

@Controller(['public/bundles', 'pos/bundles'])
@UseGuards(TenantGuard)
export class PublicBundlesController {
  constructor(private readonly bundles: BundlesService) {}

  @Get('list')
  async list(
    @CurrentTenant() tenant: TenantContext,
    @Query('locationId') locationId?: string,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = (await this.bundles.list(tenant, locationId)).filter((bundle) => bundle.isActive);
    return { success: true, data };
  }

  @Get(':id')
  async get(@CurrentTenant() tenant: TenantContext, @Param('id') id: string): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.bundles.get(tenant, id);
    return { success: true, data };
  }
}
