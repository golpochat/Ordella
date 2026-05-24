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
import { CreateOrderDto } from '../dto';
import { UpdateOrderDto } from '../dto';
import { OrderResponseDto } from '../dto';
import { OrderStatusHistoryResponseDto } from '../dto';
import { OrderEventResponseDto } from '../dto';
import { OrdersService } from '../services';

/** API Spec §5.1, §5.6, §5.7 */
@Controller('orders')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @RequirePermissions('orders:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<OrderResponseDto[]>> {
    const data = await this.ordersService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('orders:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateOrderDto,
  ): Promise<ApiSuccessResponse<OrderResponseDto>> {
    const data = await this.ordersService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('orders:read')
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<OrderResponseDto>> {
    const data = await this.ordersService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('orders:update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderDto,
  ): Promise<ApiSuccessResponse<OrderResponseDto>> {
    const data = await this.ordersService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('orders:cancel')
  async cancel(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.ordersService.cancel(tenant, id);
    return { success: true, data: null };
  }

  @Get(':id/status-history')
  @RequirePermissions('orders:read')
  async getStatusHistory(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<OrderStatusHistoryResponseDto[]>> {
    const data = await this.ordersService.getStatusHistory(tenant, id, query);
    return { success: true, data };
  }

  @Get(':id/events')
  @RequirePermissions('orders:read')
  async getEvents(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<OrderEventResponseDto[]>> {
    const data = await this.ordersService.getEvents(tenant, id, query);
    return { success: true, data };
  }
}
