import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { CreateStockReservationDto } from '../dto/stock-reservations/create-stock-reservation.dto';
import { StockReservationResponseDto } from '../dto/stock-reservations/stock-reservation-response.dto';
import { StockReservationsService } from '../services/stock-reservations.service';

/** SRS §4.3 — reserve stock on checkout */
@Controller('stock-reservations')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class StockReservationsController {
  constructor(private readonly stockReservationsService: StockReservationsService) {}

  @Get()
  @RequirePermissions('stock-reservations:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<StockReservationResponseDto[]>> {
    const data = await this.stockReservationsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('stock-reservations:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateStockReservationDto,
  ): Promise<ApiSuccessResponse<StockReservationResponseDto>> {
    const data = await this.stockReservationsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('stock-reservations:read')
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<StockReservationResponseDto>> {
    const data = await this.stockReservationsService.findOne(tenant, id);
    return { success: true, data };
  }

  @Post(':id/release')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('stock-reservations:update')
  async release(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.stockReservationsService.release(tenant, id);
  }
}
