import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { DecrementInventoryDto } from '../../inventory/dto/inventory/decrement-inventory.dto';
import { PosProductStockService } from '../services/pos-product-stock.service';

/** POST /inventory/decrement — POS product stock levels */
@Controller('inventory')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class PosInventoryController {
  constructor(private readonly productStockService: PosProductStockService) {}

  @Post('decrement')
  @RequirePermissions('pos:checkout')
  async decrement(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: DecrementInventoryDto,
  ): Promise<ApiSuccessResponse<{ updated: number }>> {
    await this.productStockService.decrementForOrder(
      tenant.tenantId,
      dto.lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
    );
    return { success: true, data: { updated: dto.lines.length } };
  }
}
