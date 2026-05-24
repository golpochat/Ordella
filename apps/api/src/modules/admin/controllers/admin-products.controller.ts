import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../constants/admin-permission-keys';
import { ProductAdminService } from '../services/product-admin.service';
import {
  AdminCreateCategoryDto,
  AdminCreateModifierDto,
  AdminCreateModifierOptionDto,
  AdminCreateProductDto,
  AdminListProductsQueryDto,
  AdminUpdateProductDto,
} from '../dto';

@Controller('admin/products')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.PRODUCTS)
export class AdminProductsController {
  constructor(private readonly productAdminService: ProductAdminService) {}

  @Get()
  async list(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: AdminListProductsQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.productAdminService.listProducts(tenant.tenantId, query);
    return { success: true, data };
  }

  @Post()
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: AdminCreateProductDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.productAdminService.createProduct(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Get('categories/list')
  async listCategories(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.productAdminService.listCategories(tenant.tenantId);
    return { success: true, data };
  }

  @Post('categories')
  async createCategory(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: AdminCreateCategoryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.productAdminService.createCategory(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Get('modifiers/list')
  async listModifiers(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.productAdminService.listModifiers(tenant.tenantId);
    return { success: true, data };
  }

  @Post('modifiers')
  async createModifier(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: AdminCreateModifierDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.productAdminService.createModifier(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Post('modifiers/:modifierId/options')
  async addModifierOption(
    @CurrentTenant() tenant: TenantContext,
    @Param('modifierId', ParseUUIDPipe) modifierId: string,
    @Body() dto: AdminCreateModifierOptionDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.productAdminService.addModifierOption(tenant.tenantId, modifierId, dto);
    return { success: true, data };
  }

  @Patch(':productId')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: AdminUpdateProductDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.productAdminService.updateProduct(tenant.tenantId, productId, dto);
    return { success: true, data };
  }

  @Post(':productId/archive')
  async archive(
    @CurrentTenant() tenant: TenantContext,
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.productAdminService.archiveProduct(tenant.tenantId, productId);
    return { success: true, data };
  }
}
