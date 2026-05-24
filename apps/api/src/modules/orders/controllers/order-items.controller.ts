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
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
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
