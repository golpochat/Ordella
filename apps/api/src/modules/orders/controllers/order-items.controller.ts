import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { CreateOrderItemDto } from '../dto';
import { UpdateOrderItemDto } from '../dto';
import { OrderItemResponseDto } from '../dto';
import { OrderItemsService } from '../services';

/** API Spec §5.2 */
@Controller('order-items')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Post()
  @RequirePermissions('orders:update')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateOrderItemDto,
  ): Promise<ApiSuccessResponse<OrderItemResponseDto>> {
    const data = await this.orderItemsService.create(tenant, dto);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('orders:update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderItemDto,
  ): Promise<ApiSuccessResponse<OrderItemResponseDto>> {
    const data = await this.orderItemsService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions('orders:update')
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.orderItemsService.remove(tenant, id);
    return { success: true, data: null };
  }
}
