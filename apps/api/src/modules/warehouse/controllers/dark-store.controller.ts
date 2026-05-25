import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import {
  CompleteDarkStorePickTaskDto,
  CreateDarkStorePickTaskDto,
  CreatePickWaveDto,
  DarkStoreOrdersQueryDto,
  FulfillmentSlotsQueryDto,
} from '../dto';
import { DarkStoreService } from '../services';

@Controller('dark-store')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.INVENTORY)
export class DarkStoreController {
  constructor(private readonly darkStore: DarkStoreService) {}

  @Get('orders')
  async orders(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: DarkStoreOrdersQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.darkStore.listOrders(tenant, query);
    return { success: true, data };
  }

  @Post('pick-task/create')
  async createPickTask(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateDarkStorePickTaskDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.darkStore.createPickTask(tenant, dto);
    return { success: true, data };
  }

  @Post('pick-task/complete')
  async completePickTask(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CompleteDarkStorePickTaskDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.darkStore.completePickTask(tenant, dto);
    return { success: true, data };
  }

  @Post('wave/create')
  async createWave(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreatePickWaveDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.darkStore.createWave(tenant, dto);
    return { success: true, data };
  }

  @Get('slots')
  async slots(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FulfillmentSlotsQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.darkStore.listSlots(tenant, query);
    return { success: true, data };
  }
}
