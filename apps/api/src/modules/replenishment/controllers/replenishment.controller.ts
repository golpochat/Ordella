import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { ReplenishmentActionQueryDto, RunReplenishmentDto, UpsertReplenishmentRuleDto } from '../dto';
import { ReplenishmentService } from '../services';

@Controller('replenishment')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class ReplenishmentController {
  constructor(private readonly replenishment: ReplenishmentService) {}

  @Post('run')
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.INVENTORY)
  async run(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: RunReplenishmentDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.replenishment.run(tenant, dto);
    return { success: true, data };
  }

  @Get('rules')
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.INVENTORY)
  async rules(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.replenishment.listRules(tenant);
    return { success: true, data };
  }

  @Post('rules/create')
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.INVENTORY)
  async createRule(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertReplenishmentRuleDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.replenishment.upsertRule(tenant, dto);
    return { success: true, data };
  }

  @Post('rules/update')
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.INVENTORY)
  async updateRule(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertReplenishmentRuleDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.replenishment.upsertRule(tenant, dto);
    return { success: true, data };
  }

  @Get('actions')
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.INVENTORY)
  async actions(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ReplenishmentActionQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.replenishment.listActions(tenant, query);
    return { success: true, data };
  }
}
