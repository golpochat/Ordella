import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import {
  CreateWorkflowDto,
  ResolveApprovalDto,
  RetryStepRunDto,
  SaveWorkflowCanvasDto,
  StartWorkflowRunDto,
  TriggerEventDto,
  UpdateWorkflowDto,
  UpsertWorkflowTriggerDto,
} from '../dto';
import { OrchestrationService } from '../services';

@Controller('orchestration')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class OrchestrationController {
  constructor(private readonly orchestration: OrchestrationService) {}

  @Get('dashboard')
  @RequirePermissions('orchestration.read')
  async dashboard(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.orchestration.dashboard(tenant) };
  }

  @Get('workflows')
  @RequirePermissions('orchestration.read')
  async listWorkflows(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.orchestration.listWorkflows(tenant) };
  }

  @Post('workflows')
  @RequirePermissions('orchestration.admin')
  async createWorkflow(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: CreateWorkflowDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.orchestration.createWorkflow(tenant, user, dto) };
  }

  @Get('workflows/:id')
  @RequirePermissions('orchestration.read')
  async getWorkflow(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.orchestration.getWorkflow(tenant, id) };
  }

  @Put('workflows/:id')
  @RequirePermissions('orchestration.admin')
  async updateWorkflow(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.orchestration.updateWorkflow(tenant, user, id, dto) };
  }

  @Post('workflows/:id/publish')
  @RequirePermissions('orchestration.admin')
  async publish(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.orchestration.publishVersion(tenant, user, id) };
  }

  @Put('workflows/:id/canvas')
  @RequirePermissions('orchestration.admin')
  async saveCanvas(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') id: string,
    @Body() dto: SaveWorkflowCanvasDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.orchestration.saveCanvas(tenant, user, id, dto) };
  }

  @Post('workflows/:id/triggers')
  @RequirePermissions('orchestration.admin')
  async upsertTrigger(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') id: string,
    @Body() dto: UpsertWorkflowTriggerDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.orchestration.upsertTrigger(tenant, user, id, dto) };
  }

  @Get('runs')
  @RequirePermissions('orchestration.read')
  async listRuns(
    @CurrentTenant() tenant: TenantContext,
    @Query('workflowId') workflowId?: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.orchestration.listRuns(tenant, workflowId) };
  }

  @Get('runs/:id')
  @RequirePermissions('orchestration.read')
  async getRun(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.orchestration.getRun(tenant, id) };
  }

  @Post('workflows/:id/run')
  @RequirePermissions('orchestration.run')
  async startRun(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') id: string,
    @Body() dto: StartWorkflowRunDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.orchestration.startRun(tenant, user, id, dto) };
  }

  @Post('triggers/event')
  @RequirePermissions('orchestration.run')
  async triggerEvent(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: TriggerEventDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.orchestration.triggerFromEvent(tenant, dto) };
  }

  @Get('approvals/inbox')
  @RequirePermissions('orchestration.approve')
  async inbox(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.orchestration.approvalInbox(tenant, user.id) };
  }

  @Post('approvals/:id/resolve')
  @RequirePermissions('orchestration.approve')
  async resolveApproval(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ResolveApprovalDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.orchestration.resolveApproval(tenant, user, id, dto) };
  }

  @Post('step-runs/:id/retry')
  @RequirePermissions('orchestration.admin')
  async retryStep(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') id: string,
    @Body() dto: RetryStepRunDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.orchestration.retryStepRun(tenant, user, id, dto) };
  }

  @Get('dead-letters')
  @RequirePermissions('orchestration.read')
  async deadLetters(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.orchestration.listDeadLetters(tenant) };
  }
}
