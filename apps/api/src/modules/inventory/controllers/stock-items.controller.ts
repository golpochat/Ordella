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
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { FilterPaginationDto } from '../../../common/dto';
import { CreateStockItemDto } from '../dto';
import { UpdateStockItemDto } from '../dto';
import { StockItemResponseDto } from '../dto';
import { StockItemsService } from '../services';

/** API Spec §4.1 */
@Controller('stock-items')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class StockItemsController {
  constructor(private readonly stockItemsService: StockItemsService) {}

  @Get()
  @RequirePermissions('stock-items:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<StockItemResponseDto[]>> {
    const data = await this.stockItemsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('stock-items:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateStockItemDto,
  ): Promise<ApiSuccessResponse<StockItemResponseDto>> {
    const data = await this.stockItemsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('stock-items:read')
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<StockItemResponseDto>> {
    const data = await this.stockItemsService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('stock-items:update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockItemDto,
  ): Promise<ApiSuccessResponse<StockItemResponseDto>> {
    const data = await this.stockItemsService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('stock-items:delete')
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.stockItemsService.remove(tenant, id);
    return { success: true, data: null };
  }
}
