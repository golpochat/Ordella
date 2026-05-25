import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { DecideRoutingDto, RoutingDecisionQueryDto, UpsertRoutingRuleDto } from '../dto';
import { RoutingService } from '../services';

@Controller('routing')
@UseGuards(TenantGuard)
export class RoutingController {
  constructor(private readonly routing: RoutingService) {}

  @Post('decide')
  async decide(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: DecideRoutingDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.routing.decide(tenant, dto);
    return { success: true, data };
  }

  @Get('rules')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  async rules(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.routing.listRules(tenant);
    return { success: true, data };
  }

  @Post('rules/create')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  async createRule(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertRoutingRuleDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.routing.upsertRule(tenant, dto);
    return { success: true, data };
  }

  @Post('rules/update')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.SETTINGS)
  async updateRule(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpsertRoutingRuleDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.routing.upsertRule(tenant, dto);
    return { success: true, data };
  }

  @Get('decisions')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.REPORTS)
  async decisions(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: RoutingDecisionQueryDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.routing.listDecisions(tenant, query);
    return { success: true, data };
  }
}
