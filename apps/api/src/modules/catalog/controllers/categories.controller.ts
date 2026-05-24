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
import { CreateCategoryDto } from '../dto/categories/create-category.dto';
import { UpdateCategoryDto } from '../dto/categories/update-category.dto';
import { CategoryResponseDto } from '../dto/categories/category-response.dto';
import { CategoriesService } from '../services/categories.service';

/** API Spec §3.5 */
@Controller('categories')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @RequirePermissions('categories:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<CategoryResponseDto[]>> {
    const data = await this.categoriesService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('categories:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateCategoryDto,
  ): Promise<ApiSuccessResponse<CategoryResponseDto>> {
    const data = await this.categoriesService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('categories:read')
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<CategoryResponseDto>> {
    const data = await this.categoriesService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('categories:update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<ApiSuccessResponse<CategoryResponseDto>> {
    const data = await this.categoriesService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('categories:delete')
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.categoriesService.remove(tenant, id);
    return { success: true, data: null };
  }
}
