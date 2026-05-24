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
import { FilterPaginationDto } from '../../auth/dto/filter-pagination.dto';
import { CreateStockMovementDto } from '../dto/stock-movements/create-stock-movement.dto';
import { StockMovementResponseDto } from '../dto/stock-movements/stock-movement-response.dto';
import { StockMovementsService } from '../services/stock-movements.service';

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
