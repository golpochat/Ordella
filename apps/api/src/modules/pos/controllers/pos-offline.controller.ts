import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { PosPermissionKeys } from '../constants/permission-keys';
import { PosOfflineSyncInventoryDto, PosOfflineSyncOrdersDto } from '../dto';
import { PosOfflineSyncService } from '../services/pos-offline-sync.service';

@Controller('pos/offline')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class PosOfflineController {
  constructor(private readonly offlineSyncService: PosOfflineSyncService) {}

  @Get('bootstrap')
  @RequirePermissions(PosPermissionKeys.POS_CATALOG)
  async bootstrap(
    @CurrentTenant() tenant: TenantContext,
    @Query('locationId') locationId?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.offlineSyncService.bootstrap(tenant, locationId);
    return { success: true, data };
  }

  @Post('sync-orders')
  @RequirePermissions(PosPermissionKeys.POS_CHECKOUT, PosPermissionKeys.POS_PAYMENT)
  async syncOrders(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: PosOfflineSyncOrdersDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.offlineSyncService.syncOrders(tenant, dto, user);
    return { success: true, data };
  }

  @Post('sync-inventory')
  @RequirePermissions(PosPermissionKeys.POS_CHECKOUT)
  async syncInventory(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: PosOfflineSyncInventoryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.offlineSyncService.syncInventory(tenant, dto);
    return { success: true, data };
  }
}
