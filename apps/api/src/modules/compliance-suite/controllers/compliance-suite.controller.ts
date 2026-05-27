import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import {
  CreateAuditorUserDto,
  CreateIncidentDto,
  CreateRiskDto,
  GenerateExportReportDto,
  RunControlTestsDto,
  SavePolicyDto,
  UpdateIncidentDto,
  UploadEvidenceDto,
  UpsertDataGovernanceDto,
  UpsertSecuritySettingsDto,
} from '../dto';
import { ComplianceSuiteService } from '../services/compliance-suite.service';

@Controller('compliance-suite')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class ComplianceSuiteController {
  constructor(private readonly compliance: ComplianceSuiteService) {}

  @Get('dashboard')
  @RequirePermissions('compliance-suite.read')
  async dashboard(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    return { success: true, data: await this.compliance.dashboard(tenant) };
  }

  @Get('frameworks')
  @RequirePermissions('compliance-suite.read')
  async frameworks(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.compliance.listFrameworks(tenant) };
  }

  @Get('controls')
  @RequirePermissions('compliance-suite.read')
  async controls(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.compliance.listControls(tenant) };
  }

  @Get('risks')
  @RequirePermissions('compliance-suite.read')
  async risks(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.compliance.listRisks(tenant) };
  }

  @Post('risks')
  @RequirePermissions('compliance-suite.manage')
  async createRisk(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRiskDto,
  ) {
    return { success: true, data: await this.compliance.createRisk(tenant, user, dto) };
  }

  @Get('evidence')
  @RequirePermissions('compliance-suite.read')
  async evidence(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.compliance.listEvidence(tenant) };
  }

  @Post('evidence')
  @RequirePermissions('compliance-suite.evidence')
  async uploadEvidence(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UploadEvidenceDto,
  ) {
    return { success: true, data: await this.compliance.uploadEvidence(tenant, user, dto) };
  }

  @Get('policies')
  @RequirePermissions('compliance-suite.read')
  async policies(@CurrentTenant() tenant: TenantContext, @Query('policyKey') policyKey?: string) {
    return { success: true, data: await this.compliance.listPolicies(tenant, policyKey) };
  }

  @Post('policies')
  @RequirePermissions('compliance-suite.policies')
  async savePolicy(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SavePolicyDto,
  ) {
    return { success: true, data: await this.compliance.savePolicy(tenant, user, dto) };
  }

  @Get('incidents')
  @RequirePermissions('compliance-suite.read')
  async incidents(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.compliance.listIncidents(tenant) };
  }

  @Post('incidents')
  @RequirePermissions('compliance-suite.incidents')
  async createIncident(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateIncidentDto,
  ) {
    return { success: true, data: await this.compliance.createIncident(tenant, user, dto) };
  }

  @Put('incidents/:id')
  @RequirePermissions('compliance-suite.incidents')
  async updateIncident(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncidentDto,
  ) {
    return { success: true, data: await this.compliance.updateIncident(tenant, id, dto) };
  }

  @Get('vendors')
  @RequirePermissions('compliance-suite.read')
  async vendors(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.compliance.listVendors(tenant) };
  }

  @Get('security')
  @RequirePermissions('compliance-suite.security')
  async security(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.compliance.getSecuritySettings(tenant) };
  }

  @Put('security')
  @RequirePermissions('compliance-suite.security')
  async updateSecurity(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertSecuritySettingsDto,
  ) {
    return { success: true, data: await this.compliance.updateSecuritySettings(tenant, user, dto) };
  }

  @Get('data-governance')
  @RequirePermissions('compliance-suite.governance')
  async dataGovernance(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.compliance.getDataGovernance(tenant) };
  }

  @Put('data-governance')
  @RequirePermissions('compliance-suite.governance')
  async updateDataGovernance(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertDataGovernanceDto,
  ) {
    return { success: true, data: await this.compliance.updateDataGovernance(tenant, user, dto) };
  }

  @Post('controls/test')
  @RequirePermissions('compliance-suite.controls')
  async runTests(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RunControlTestsDto,
  ) {
    return { success: true, data: await this.compliance.runControlTests(tenant, user, dto) };
  }

  @Get('monitoring/alerts')
  @RequirePermissions('compliance-suite.read')
  async alerts(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.compliance.listMonitoringAlerts(tenant) };
  }

  @Get('procurement')
  @RequirePermissions('compliance-suite.procurement')
  async procurement(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.compliance.listProcurementArtifacts(tenant) };
  }

  @Get('questionnaires')
  @RequirePermissions('compliance-suite.procurement')
  async questionnaires(@CurrentTenant() tenant: TenantContext) {
    return { success: true, data: await this.compliance.listQuestionnaires(tenant) };
  }

  @Post('reports/export')
  @RequirePermissions('compliance-suite.audit')
  async exportReport(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GenerateExportReportDto,
  ) {
    return { success: true, data: await this.compliance.generateExportReport(tenant, user, dto) };
  }

  @Post('auditors')
  @RequirePermissions('compliance-suite.auditor')
  async createAuditor(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAuditorUserDto,
  ) {
    return { success: true, data: await this.compliance.createAuditorUser(tenant, user, dto) };
  }
}
