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
import { CreateStockMovementDto } from '../dto';
import { StockMovementResponseDto } from '../dto';
import { StockMovementsService } from '../services';

/** API Spec §4.2 — append-only ledger */
@Controller('stock-movements')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Get()
  @RequirePermissions('stock-movements:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<StockMovementResponseDto[]>> {
    const data = await this.stockMovementsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('stock-movements:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateStockMovementDto,
  ): Promise<ApiSuccessResponse<StockMovementResponseDto>> {
    const data = await this.stockMovementsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('stock-movements:read')
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<StockMovementResponseDto>> {
    const data = await this.stockMovementsService.findOne(tenant, id);
    return { success: true, data };
  }
}
