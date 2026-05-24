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
import { CreateVariantDto } from '../dto/variants/create-variant.dto';
import { UpdateVariantDto } from '../dto/variants/update-variant.dto';
import { VariantResponseDto } from '../dto/variants/variant-response.dto';
import { VariantsService } from '../services/variants.service';

/** API Spec §3.2 */
@Controller('variants')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Get()
  @RequirePermissions('variants:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<VariantResponseDto[]>> {
    const data = await this.variantsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('variants:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateVariantDto,
  ): Promise<ApiSuccessResponse<VariantResponseDto>> {
    const data = await this.variantsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('variants:read')
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<VariantResponseDto>> {
    const data = await this.variantsService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('variants:update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVariantDto,
  ): Promise<ApiSuccessResponse<VariantResponseDto>> {
    const data = await this.variantsService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('variants:delete')
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.variantsService.remove(tenant, id);
    return { success: true, data: null };
  }
}
