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
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import {
  CreateStockAdjustmentDto,
  StockAdjustmentResponseDto,
} from '../dto/stock-adjustments/stock-adjustment.dto';
import { StockAdjustmentsService } from '../services/stock-adjustments.service';

/** SRS §4.3 — manual adjustments */
@Controller('stock-adjustments')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class StockAdjustmentsController {
  constructor(private readonly stockAdjustmentsService: StockAdjustmentsService) {}

  @Get()
  @RequirePermissions('stock-adjustments:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: PaginationQueryDto,
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
