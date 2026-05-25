import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../constants/admin-permission-keys';
import { CatalogBuilderService } from '../services/catalog-builder.service';
import {
  CatalogCategoryCreateDto,
  CatalogCategoryDeleteDto,
  CatalogCategoryUpdateDto,
  CatalogItemAddModifierDto,
  CatalogItemCreateDto,
  CatalogItemDeleteDto,
  CatalogItemImageDto,
  CatalogItemUpdateDto,
  CatalogListItemsQueryDto,
  CatalogVariantDto,
  GlobalCategoryCreateDto,
  GlobalCategoryUpdateDto,
  GlobalItemCreateDto,
  GlobalItemUpdateDto,
  LocalCatalogOverrideDto,
  LocalCatalogResetOverrideDto,
} from '../dto/catalog-builder.dto';

@Controller('catalog')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.PRODUCTS)
export class CatalogBuilderController {
  constructor(private readonly catalogBuilder: CatalogBuilderService) {}

  @Get('global')
  async listGlobalItems(
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.listGlobalItems(tenant.tenantId);
    return { success: true, data };
  }

  @Post('global/create')
  async createGlobalItem(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: GlobalItemCreateDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.createGlobalItem(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('global/update')
  async updateGlobalItem(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: GlobalItemUpdateDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.updateGlobalItem(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Get('local')
  async listLocalCatalog(
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.listLocalCatalog(tenant.tenantId);
    return { success: true, data };
  }

  @Post('local/override')
  async overrideLocalItem(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: LocalCatalogOverrideDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.overrideLocalItem(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('local/reset-override')
  async resetLocalOverride(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: LocalCatalogResetOverrideDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.resetLocalOverride(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Get('categories/global')
  async listGlobalCategories(
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.listGlobalCategories(tenant.tenantId);
    return { success: true, data };
  }

  @Post('categories/global/create')
  async createGlobalCategory(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: GlobalCategoryCreateDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.createGlobalCategory(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('categories/global/update')
  async updateGlobalCategory(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: GlobalCategoryUpdateDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.updateGlobalCategory(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Get('categories')
  async listCategories(
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.listCategories(tenant.tenantId);
    return { success: true, data };
  }

  @Post('category/create')
  async createCategory(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CatalogCategoryCreateDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.createCategory(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('category/update')
  async updateCategory(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CatalogCategoryUpdateDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.updateCategory(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('category/delete')
  async deleteCategory(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CatalogCategoryDeleteDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    await this.catalogBuilder.deleteCategory(tenant.tenantId, dto);
    return { success: true, data: { deleted: true } };
  }

  @Get('items')
  async listItems(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: CatalogListItemsQueryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.listItems(tenant.tenantId, query);
    return { success: true, data };
  }

  @Post('item/create')
  async createItem(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CatalogItemCreateDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.createItem(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('item/update')
  async updateItem(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CatalogItemUpdateDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.updateItem(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('item/delete')
  async deleteItem(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CatalogItemDeleteDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    await this.catalogBuilder.deleteItem(tenant.tenantId, dto);
    return { success: true, data: { deleted: true } };
  }

  @Post('item/upload-image')
  async uploadImage(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CatalogItemImageDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.uploadItemImage(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('item/add-variant')
  async addVariant(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CatalogVariantDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.addVariant(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('item/add-modifier')
  async addModifier(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CatalogItemAddModifierDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.catalogBuilder.addModifierToItem(tenant.tenantId, dto);
    return { success: true, data };
  }
}
