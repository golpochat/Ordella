import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { FilterPaginationDto } from '../../auth/dto/filter-pagination.dto';
import { CreateProductDto } from '../dto/products/create-product.dto';
import { UpdateProductDto } from '../dto/products/update-product.dto';
import { ProductResponseDto } from '../dto/products/product-response.dto';
import { ProductsService } from '../services/products.service';

/** API Spec §3.1 */
@Controller('products')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermissions('products:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<ProductResponseDto[]>> {
    const data = await this.productsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('products:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateProductDto,
  ): Promise<ApiSuccessResponse<ProductResponseDto>> {
    const data = await this.productsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('products:read')
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<ProductResponseDto>> {
    const data = await this.productsService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('products:update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ApiSuccessResponse<ProductResponseDto>> {
    const data = await this.productsService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('products:delete')
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.productsService.remove(tenant, id);
    return { success: true, data: null };
  }
}
