import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { CreateStockAdjustmentDto } from '../dto';
import { StockAdjustmentResponseDto } from '../dto';
import { StockAdjustmentsService } from '../services';

/** SRS §4.3 — manual adjustments */
@Controller('stock-adjustments')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class StockAdjustmentsController {
  constructor(private readonly stockAdjustmentsService: StockAdjustmentsService) {}

  @Get()
  @RequirePermissions('stock-adjustments:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<StockAdjustmentResponseDto[]>> {
    const data = await this.stockAdjustmentsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('stock-adjustments:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateStockAdjustmentDto,
  ): Promise<ApiSuccessResponse<StockAdjustmentResponseDto>> {
    const data = await this.stockAdjustmentsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('stock-adjustments:read')
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<StockAdjustmentResponseDto>> {
    const data = await this.stockAdjustmentsService.findOne(tenant, id);
    return { success: true, data };
  }
}
