import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import {
  GenerateDecisionsDto,
  ResolveDecisionDto,
  UpdateConstraintDto,
  UpdatePolicyDto,
} from '../dto';
import { AutonomousRetailService } from '../services';

@Controller('autonomous-retail')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class AutonomousRetailController {
  constructor(private readonly autonomous: AutonomousRetailService) {}

  @Get('dashboard')
  @RequirePermissions('autonomous.read')
  async dashboard(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.autonomous.dashboard(tenant) };
  }

  @Get('policies')
  @RequirePermissions('autonomous.read')
  async policies(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.autonomous.listPolicies(tenant) };
  }

  @Put('policies')
  @RequirePermissions('autonomous.admin')
  async updatePolicy(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: UpdatePolicyDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.autonomous.updatePolicy(tenant, user, dto) };
  }

  @Get('constraints')
  @RequirePermissions('autonomous.read')
  async constraints(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.autonomous.listConstraints(tenant) };
  }

  @Put('constraints/:key')
  @RequirePermissions('autonomous.admin')
  async updateConstraint(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('key') key: string,
    @Body() dto: UpdateConstraintDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.autonomous.updateConstraint(tenant, user, key, dto) };
  }

  @Get('models')
  @RequirePermissions('autonomous.read')
  async models(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.autonomous.listModels(tenant) };
  }

  @Get('decisions')
  @RequirePermissions('autonomous.read')
  async decisions(
    @CurrentTenant() tenant: TenantContext,
    @Query('status') status?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.autonomous.listDecisions(tenant, status) };
  }

  @Get('actions')
  @RequirePermissions('autonomous.read')
  async actions(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.autonomous.listActions(tenant) };
  }

  @Post('decisions/generate')
  @RequirePermissions('autonomous.run')
  async generate(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: GenerateDecisionsDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.autonomous.generateDecisions(tenant, user, dto) };
  }

  @Post('decisions/:id/resolve')
  @RequirePermissions('autonomous.approve')
  async resolve(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ResolveDecisionDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.autonomous.resolveDecision(tenant, user, id, dto) };
  }

  @Post('actions/:id/rollback')
  @RequirePermissions('autonomous.admin')
  async rollback(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.autonomous.rollbackAction(tenant, user, id) };
  }

  @Post('triggers/event/:topicKey')
  @RequirePermissions('autonomous.run')
  async eventTrigger(
    @CurrentTenant() tenant: TenantContext,
    @Param('topicKey') topicKey: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.autonomous.triggerFromEvent(tenant, topicKey) };
  }
}
