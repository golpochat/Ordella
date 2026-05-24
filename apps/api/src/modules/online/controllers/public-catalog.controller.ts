import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { OnlineCatalogService } from '../services/online-catalog.service';

/** Public storefront catalog — tenant via X-Tenant-Id, no auth */
@Controller('catalog')
@UseGuards(TenantGuard)
export class PublicCatalogController {
  constructor(private readonly onlineCatalog: OnlineCatalogService) {}

  @Get()
  async getCatalog(
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<{ categories: unknown[]; items: unknown[] }>> {
    const data = await this.onlineCatalog.getCatalogBundle(tenant.tenantId);
    return { success: true, data };
  }

  @Get('categories')
  async listCategories(
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.onlineCatalog.listCategories(tenant.tenantId);
    return { success: true, data };
  }

  @Get('items')
  async listItems(
    @CurrentTenant() tenant: TenantContext,
    @Query('categoryId') categoryId?: string,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.onlineCatalog.listItems(tenant.tenantId, categoryId);
    return { success: true, data };
  }
}
