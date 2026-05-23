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
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import { CreateStoreDto } from '../dto/stores/create-store.dto';
import { UpdateStoreDto } from '../dto/stores/update-store.dto';
import { StoreResponseDto } from '../dto/stores/store-response.dto';
import { StoresService } from '../services/stores.service';

/** SRS §2.3 — stores under tenant (tenant-scoped) */
@Controller('stores')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  @RequirePermissions('stores:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: PaginationQueryDto,
  ): Promise<ApiSuccessResponse<StoreResponseDto[]>> {
    const data = await this.storesService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('stores:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateStoreDto,
  ): Promise<ApiSuccessResponse<StoreResponseDto>> {
    const data = await this.storesService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('stores:read')
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<StoreResponseDto>> {
    const data = await this.storesService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('stores:update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoreDto,
  ): Promise<ApiSuccessResponse<StoreResponseDto>> {
    const data = await this.storesService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('stores:delete')
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.storesService.remove(tenant, id);
    return { success: true, data: null };
  }
}
