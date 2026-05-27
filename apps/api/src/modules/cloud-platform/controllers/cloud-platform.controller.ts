import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import {
  AssignTenantRegionDto,
  ProvisionRegionDto,
  RegisterEdgeNodeDto,
  StartDeploymentDto,
  UpsertCdnConfigDto,
  UpsertFailoverRuleDto,
  UpsertResidencyPolicyDto,
  UpsertRoutingPolicyDto,
} from '../dto';
import { CloudPlatformService } from '../services/cloud-platform.service';

@Controller('cloud-platform')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class CloudPlatformController {
  constructor(private readonly cloudPlatform: CloudPlatformService) {}

  @Get('dashboard')
  @RequirePermissions('cloud-platform.read')
  async dashboard(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.cloudPlatform.dashboard(tenant) };
  }

  @Get('regions')
  @RequirePermissions('cloud-platform.read')
  async regions(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.cloudPlatform.listRegions(tenant) };
  }

  @Get('assignments')
  @RequirePermissions('cloud-platform.read')
  async assignments(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.cloudPlatform.listAssignments(tenant) };
  }

  @Post('assignments')
  @RequirePermissions('cloud-platform.regions')
  async assignRegion(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AssignTenantRegionDto,
  ) {
    return { success: true, data: await this.cloudPlatform.assignRegion(tenant, user, dto) };
  }

  @Get('residency')
  @RequirePermissions('cloud-platform.read')
  async residency(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.cloudPlatform.getResidencyPolicy(tenant) };
  }

  @Put('residency')
  @RequirePermissions('cloud-platform.governance')
  async updateResidency(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertResidencyPolicyDto,
  ) {
    return { success: true, data: await this.cloudPlatform.updateResidencyPolicy(tenant, user, dto) };
  }

  @Get('routing')
  @RequirePermissions('cloud-platform.read')
  async routing(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.cloudPlatform.getRoutingPolicy(tenant) };
  }

  @Put('routing')
  @RequirePermissions('cloud-platform.infrastructure')
  async updateRouting(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertRoutingPolicyDto,
  ) {
    return { success: true, data: await this.cloudPlatform.updateRoutingPolicy(tenant, user, dto) };
  }

  @Get('failover')
  @RequirePermissions('cloud-platform.read')
  async failover(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.cloudPlatform.listFailoverRules(tenant) };
  }

  @Put('failover')
  @RequirePermissions('cloud-platform.infrastructure')
  async upsertFailover(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertFailoverRuleDto,
  ) {
    return { success: true, data: await this.cloudPlatform.upsertFailoverRule(tenant, user, dto) };
  }

  @Get('replication')
  @RequirePermissions('cloud-platform.read')
  async replication(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.cloudPlatform.listReplicationLinks(tenant) };
  }

  @Get('edge-nodes')
  @RequirePermissions('cloud-platform.read')
  async edgeNodes(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.cloudPlatform.listEdgeNodes(tenant) };
  }

  @Post('edge-nodes')
  @RequirePermissions('cloud-platform.infrastructure')
  async registerEdgeNode(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterEdgeNodeDto,
  ) {
    return { success: true, data: await this.cloudPlatform.registerEdgeNode(tenant, user, dto) };
  }

  @Get('deployments')
  @RequirePermissions('cloud-platform.read')
  async deployments(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.cloudPlatform.listDeployments(tenant) };
  }

  @Post('deployments/provision')
  @RequirePermissions('cloud-platform.deploy')
  async provision(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ProvisionRegionDto,
  ) {
    return { success: true, data: await this.cloudPlatform.provisionRegion(tenant, user, dto) };
  }

  @Post('deployments')
  @RequirePermissions('cloud-platform.deploy')
  async startDeployment(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: StartDeploymentDto,
  ) {
    return { success: true, data: await this.cloudPlatform.startDeployment(tenant, user, dto) };
  }

  @Post('deployments/:id/rollback')
  @RequirePermissions('cloud-platform.deploy')
  async rollback(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return { success: true, data: await this.cloudPlatform.rollbackDeployment(tenant, user, id) };
  }

  @Get('metrics')
  @RequirePermissions('cloud-platform.monitoring')
  async metrics(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.cloudPlatform.getRegionMetrics(tenant) };
  }

  @Get('monitoring/alerts')
  @RequirePermissions('cloud-platform.monitoring')
  async alerts(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.cloudPlatform.listMonitoringAlerts(tenant) };
  }

  @Get('cdn')
  @RequirePermissions('cloud-platform.read')
  async cdn(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.cloudPlatform.getCdnConfig(tenant) };
  }

  @Put('cdn')
  @RequirePermissions('cloud-platform.infrastructure')
  async updateCdn(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertCdnConfigDto,
  ) {
    return { success: true, data: await this.cloudPlatform.updateCdnConfig(tenant, user, dto) };
  }

  @Get('encryption-keys')
  @RequirePermissions('cloud-platform.security')
  async encryptionKeys(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.cloudPlatform.listEncryptionKeys(tenant) };
  }

  @Get('cross-region-logs')
  @RequirePermissions('cloud-platform.security')
  async crossRegionLogs(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.cloudPlatform.listCrossRegionAccessLogs(tenant) };
  }
}
