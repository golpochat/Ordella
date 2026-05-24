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
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import {
  CreateStockTransferDto,
  StockTransferResponseDto,
  UpdateStockTransferDto,
} from '../dto/stock-transfers/stock-transfer.dto';
import { StockTransfersService } from '../services/stock-transfers.service';

/** API Spec §4.3 */
@Controller('stock-transfers')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class StockTransfersController {
  constructor(private readonly stockTransfersService: StockTransfersService) {}

  @Get()
  @RequirePermissions('stock-transfers:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: PaginationQueryDto,
  ): Promise<ApiSuccessResponse<StockTransferResponseDto[]>> {
    const data = await this.stockTransfersService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('stock-transfers:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateStockTransferDto,
  ): Promise<ApiSuccessResponse<StockTransferResponseDto>> {
    const data = await this.stockTransfersService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('stock-transfers:read')
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<StockTransferResponseDto>> {
    const data = await this.stockTransfersService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('stock-transfers:update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockTransferDto,
  ): Promise<ApiSuccessResponse<StockTransferResponseDto>> {
    const data = await this.stockTransfersService.update(tenant, id, dto);
    return { success: true, data };
  }
}
