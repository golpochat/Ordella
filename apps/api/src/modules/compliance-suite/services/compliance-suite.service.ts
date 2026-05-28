import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { In, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { AuditLogService } from '../../audit/services';
import { SsoProviderEntity } from '../../auth/entities';
import { hashPassword, verifyPassword } from '../../onboarding/utils/password.util';
import {
  AuditorLoginDto,
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
import {
  ComplianceAuditorUserEntity,
  ComplianceControlEntity,
  ComplianceControlTestRunEntity,
  ComplianceDataAccessLogEntity,
  ComplianceDataGovernanceEntity,
  ComplianceEvidenceEntity,
  ComplianceExportReportEntity,
  ComplianceFrameworkEntity,
  ComplianceIncidentEntity,
  ComplianceMonitoringAlertEntity,
  CompliancePolicyVersionEntity,
  ComplianceProcurementArtifactEntity,
  ComplianceQuestionnaireEntity,
  ComplianceRiskEntity,
  ComplianceSecuritySettingsEntity,
  ComplianceVendorEntity,
} from '../entities';
import { AuditorAuthPayload } from '../types/auditor-auth-payload';

const SEED_FRAMEWORKS = [
  { frameworkKey: 'soc2_type1', displayName: 'SOC 2 Type I', frameworkType: 'security' },
  { frameworkKey: 'soc2_type2', displayName: 'SOC 2 Type II', frameworkType: 'security' },
  { frameworkKey: 'iso27001', displayName: 'ISO 27001', frameworkType: 'security' },
  { frameworkKey: 'pci_dss', displayName: 'PCI DSS', frameworkType: 'payments' },
  { frameworkKey: 'gdpr', displayName: 'GDPR', frameworkType: 'privacy' },
  { frameworkKey: 'regional_privacy', displayName: 'Regional Privacy Laws', frameworkType: 'privacy' },
  { frameworkKey: 'data_residency', displayName: 'Data Residency Policies', frameworkType: 'governance' },
] as const;

const SEED_CONTROLS: Array<{ controlKey: string; frameworkKey: string; title: string; category: string }> = [
  { controlKey: 'CC6.1', frameworkKey: 'soc2_type2', title: 'Logical access controls', category: 'access' },
  { controlKey: 'CC7.2', frameworkKey: 'soc2_type2', title: 'System monitoring', category: 'monitoring' },
  { controlKey: 'A.9.2', frameworkKey: 'iso27001', title: 'User access management', category: 'access' },
  { controlKey: 'A.12.4', frameworkKey: 'iso27001', title: 'Logging and monitoring', category: 'monitoring' },
  { controlKey: 'PCI-3.4', frameworkKey: 'pci_dss', title: 'Protect stored cardholder data', category: 'payments' },
  { controlKey: 'GDPR-32', frameworkKey: 'gdpr', title: 'Security of processing', category: 'privacy' },
  { controlKey: 'RES-01', frameworkKey: 'data_residency', title: 'EU data residency enforcement', category: 'residency' },
];

@Injectable()
export class ComplianceSuiteService {
  constructor(
    @InjectRepository(ComplianceFrameworkEntity)
    private readonly frameworks: Repository<ComplianceFrameworkEntity>,
    @InjectRepository(ComplianceControlEntity)
    private readonly controls: Repository<ComplianceControlEntity>,
    @InjectRepository(ComplianceRiskEntity)
    private readonly risks: Repository<ComplianceRiskEntity>,
    @InjectRepository(ComplianceEvidenceEntity)
    private readonly evidence: Repository<ComplianceEvidenceEntity>,
    @InjectRepository(ComplianceControlTestRunEntity)
    private readonly controlTests: Repository<ComplianceControlTestRunEntity>,
    @InjectRepository(CompliancePolicyVersionEntity)
    private readonly policies: Repository<CompliancePolicyVersionEntity>,
    @InjectRepository(ComplianceIncidentEntity)
    private readonly incidents: Repository<ComplianceIncidentEntity>,
    @InjectRepository(ComplianceVendorEntity)
    private readonly vendors: Repository<ComplianceVendorEntity>,
    @InjectRepository(ComplianceSecuritySettingsEntity)
    private readonly securitySettings: Repository<ComplianceSecuritySettingsEntity>,
    @InjectRepository(ComplianceDataGovernanceEntity)
    private readonly dataGovernance: Repository<ComplianceDataGovernanceEntity>,
    @InjectRepository(ComplianceDataAccessLogEntity)
    private readonly dataAccessLogs: Repository<ComplianceDataAccessLogEntity>,
    @InjectRepository(ComplianceAuditorUserEntity)
    private readonly auditorUsers: Repository<ComplianceAuditorUserEntity>,
    @InjectRepository(ComplianceProcurementArtifactEntity)
    private readonly procurementArtifacts: Repository<ComplianceProcurementArtifactEntity>,
    @InjectRepository(ComplianceQuestionnaireEntity)
    private readonly questionnaires: Repository<ComplianceQuestionnaireEntity>,
    @InjectRepository(ComplianceMonitoringAlertEntity)
    private readonly monitoringAlerts: Repository<ComplianceMonitoringAlertEntity>,
    @InjectRepository(ComplianceExportReportEntity)
    private readonly exportReports: Repository<ComplianceExportReportEntity>,
    @InjectRepository(SsoProviderEntity)
    private readonly ssoProviders: Repository<SsoProviderEntity>,
    private readonly auditLogs: AuditLogService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly ensureDefaultsLocks = new Map<string, Promise<void>>();

  async dashboard(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    const [
      frameworkRows,
      controlRows,
      riskRows,
      openIncidents,
      openAlerts,
      evidenceCount,
      testRuns,
      policyCount,
      vendorCount,
      auditCompliance,
      ssoCount,
      security,
      governance,
    ] = await Promise.all([
      this.frameworks.count({ where: { tenantId: tenant.tenantId } }),
      this.controls.count({ where: { tenantId: tenant.tenantId } }),
      this.risks.find({ where: { tenantId: tenant.tenantId } }),
      this.incidents.count({ where: { tenantId: tenant.tenantId, status: In(['open', 'investigating']) } }),
      this.monitoringAlerts.count({ where: { tenantId: tenant.tenantId, status: 'open' } }),
      this.evidence.count({ where: { tenantId: tenant.tenantId } }),
      this.controlTests.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' }, take: 10 }),
      this.policies.count({ where: { tenantId: tenant.tenantId, status: 'published' } }),
      this.vendors.count({ where: { tenantId: tenant.tenantId } }),
      this.auditLogs.complianceStatus(tenant),
      this.ssoProviders.count({ where: { tenantId: tenant.tenantId, isActive: true } }),
      this.ensureSecuritySettings(tenant.tenantId),
      this.ensureDataGovernance(tenant.tenantId),
    ]);

    const heatmap = this.buildRiskHeatmap(riskRows);
    const passedTests = testRuns.filter((r) => r.status === 'passed').length;
    const controlCoverage = controlRows ? Math.round((passedTests / Math.max(testRuns.length, 1)) * 100) : 0;

    return {
      frameworks: frameworkRows,
      controls: controlRows,
      risks: riskRows.length,
      openIncidents,
      openAlerts,
      evidenceCount,
      publishedPolicies: policyCount,
      vendors: vendorCount,
      controlCoveragePercent: controlCoverage,
      riskHeatmap: heatmap,
      auditCenter: auditCompliance,
      security: {
        mfaEnforced: security.mfaEnforced,
        ipAllowlistCount: security.ipAllowlist?.length ?? 0,
        ssoProvidersActive: ssoCount,
        scimEnabled: security.scimEnabled,
      },
      dataGovernance: {
        classificationRules: governance.classificationRules?.length ?? 0,
        retentionRules: governance.retentionRules?.length ?? 0,
        residencyRegions: (governance.residencyPolicy as { allowedRegions?: string[] })?.allowedRegions ?? [],
      },
      monitoring: {
        siemIntegration: 'webhook_ready',
        anomalyDetection: openAlerts > 0,
        complianceDrift: openAlerts,
      },
    };
  }

  async listFrameworks(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    return this.frameworks.find({ where: { tenantId: tenant.tenantId }, order: { displayName: 'ASC' } });
  }

  async listControls(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    return this.controls.find({ where: { tenantId: tenant.tenantId }, order: { controlKey: 'ASC' } });
  }

  async listRisks(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    return this.risks.find({ where: { tenantId: tenant.tenantId }, order: { residualScore: 'DESC' } });
  }

  async createRisk(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: CreateRiskDto) {
    const likelihood = dto.likelihood ?? 3;
    const impact = dto.impact ?? 3;
    const score = likelihood * impact;
    const riskKey = `risk-${randomBytes(4).toString('hex')}`;
    return this.risks.save(
      this.risks.create({
        tenantId: tenant.tenantId,
        riskKey,
        title: dto.title.trim(),
        description: dto.description ?? '',
        likelihood,
        impact,
        inherentScore: score,
        residualScore: score,
        status: 'open',
        ownerUserId: user?.id ?? null,
        metadata: {},
      }),
    );
  }

  async listEvidence(tenant: TenantContext) {
    return this.evidence.find({ where: { tenantId: tenant.tenantId }, order: { collectedAt: 'DESC' }, take: 100 });
  }

  async uploadEvidence(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: UploadEvidenceDto) {
    if (dto.controlId) {
      const control = await this.controls.findOne({ where: { id: dto.controlId, tenantId: tenant.tenantId } });
      if (!control) throw new NotFoundException('Control not found');
    }
    return this.evidence.save(
      this.evidence.create({
        tenantId: tenant.tenantId,
        controlId: dto.controlId ?? null,
        evidenceType: dto.evidenceType ?? 'document',
        title: dto.title.trim(),
        storageUri: dto.storageUri ?? `compliance://${tenant.tenantId}/${randomBytes(8).toString('hex')}`,
        collectedByUserId: user?.id ?? null,
        collectedAt: new Date(),
        status: 'submitted',
        metadata: {},
      }),
    );
  }

  async listPolicies(tenant: TenantContext, policyKey?: string) {
    const where = policyKey
      ? { tenantId: tenant.tenantId, policyKey }
      : { tenantId: tenant.tenantId };
    return this.policies.find({ where, order: { policyKey: 'ASC', version: 'DESC' } });
  }

  async savePolicy(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: SavePolicyDto) {
    const latest = await this.policies.findOne({
      where: { tenantId: tenant.tenantId, policyKey: dto.policyKey },
      order: { version: 'DESC' },
    });
    const version = (latest?.version ?? 0) + 1;
    const status = dto.status ?? 'draft';
    const row = await this.policies.save(
      this.policies.create({
        tenantId: tenant.tenantId,
        policyKey: dto.policyKey,
        version,
        title: dto.title.trim(),
        content: dto.content,
        status,
        publishedAt: status === 'published' ? new Date() : null,
        publishedByUserId: status === 'published' ? user?.id ?? null : null,
        metadata: {},
      }),
    );
    await this.audit(tenant, user, 'compliance_suite.policy_saved', 'compliance_policy', row.id, {
      policyKey: dto.policyKey,
      version,
      status,
    });
    return row;
  }

  async listIncidents(tenant: TenantContext) {
    return this.incidents.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' }, take: 50 });
  }

  async createIncident(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: CreateIncidentDto) {
    const incidentKey = `inc-${randomBytes(4).toString('hex')}`;
    return this.incidents.save(
      this.incidents.create({
        tenantId: tenant.tenantId,
        incidentKey,
        title: dto.title.trim(),
        severity: dto.severity ?? 'medium',
        status: 'open',
        reportedByUserId: user?.id ?? null,
        assignedToUserId: null,
        description: dto.description ?? '',
        timeline: [{ at: new Date().toISOString(), event: 'reported', by: user?.id ?? 'system' }],
        resolvedAt: null,
        metadata: {},
      }),
    );
  }

  async updateIncident(tenant: TenantContext, id: string, dto: UpdateIncidentDto) {
    const incident = await this.incidents.findOne({ where: { id, tenantId: tenant.tenantId } });
    if (!incident) throw new NotFoundException('Incident not found');
    if (dto.status) incident.status = dto.status;
    if (dto.assignedToUserId !== undefined) incident.assignedToUserId = dto.assignedToUserId;
    if (dto.note) {
      const timeline = Array.isArray(incident.timeline) ? [...incident.timeline] : [];
      timeline.push({ at: new Date().toISOString(), event: dto.note, status: dto.status });
      incident.timeline = timeline;
    }
    if (dto.status === 'resolved' || dto.status === 'closed') incident.resolvedAt = new Date();
    incident.updatedAt = new Date();
    return this.incidents.save(incident);
  }

  async listVendors(tenant: TenantContext) {
    await this.ensureVendorSeeds(tenant);
    return this.vendors.find({ where: { tenantId: tenant.tenantId }, order: { name: 'ASC' } });
  }

  async getSecuritySettings(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    return this.ensureSecuritySettings(tenant.tenantId);
  }

  async updateSecuritySettings(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: UpsertSecuritySettingsDto) {
    const row = await this.ensureSecuritySettings(tenant.tenantId);
    if (dto.mfaEnforced !== undefined) row.mfaEnforced = dto.mfaEnforced;
    if (dto.passwordPolicy !== undefined) row.passwordPolicy = dto.passwordPolicy;
    if (dto.sessionPolicy !== undefined) row.sessionPolicy = dto.sessionPolicy;
    if (dto.deviceTrustRules !== undefined) row.deviceTrustRules = dto.deviceTrustRules;
    if (dto.ipAllowlist !== undefined) row.ipAllowlist = dto.ipAllowlist;
    if (dto.ssoConfig !== undefined) row.ssoConfig = dto.ssoConfig;
    if (dto.scimEnabled !== undefined) row.scimEnabled = dto.scimEnabled;
    row.updatedAt = new Date();
    const saved = await this.securitySettings.save(row);
    await this.audit(tenant, user, 'compliance_suite.security_updated', 'compliance_security_settings', saved.id, {
      mfaEnforced: saved.mfaEnforced,
      ipAllowlistCount: saved.ipAllowlist.length,
    });
    return saved;
  }

  async getDataGovernance(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    return this.ensureDataGovernance(tenant.tenantId);
  }

  async updateDataGovernance(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: UpsertDataGovernanceDto) {
    const row = await this.ensureDataGovernance(tenant.tenantId);
    if (dto.classificationRules !== undefined) row.classificationRules = dto.classificationRules;
    if (dto.piiMasking !== undefined) row.piiMasking = dto.piiMasking;
    if (dto.encryptionPolicy !== undefined) row.encryptionPolicy = dto.encryptionPolicy;
    if (dto.retentionRules !== undefined) row.retentionRules = dto.retentionRules;
    if (dto.residencyPolicy !== undefined) row.residencyPolicy = dto.residencyPolicy;
    row.updatedAt = new Date();
    const saved = await this.dataGovernance.save(row);
    await this.audit(tenant, user, 'compliance_suite.data_governance_updated', 'compliance_data_governance', saved.id, {});
    return saved;
  }

  async runControlTests(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: RunControlTestsDto) {
    await this.ensureDefaults(tenant);
    const controls = dto.controlIds?.length
      ? await this.controls.find({ where: { tenantId: tenant.tenantId, id: In(dto.controlIds) } })
      : await this.controls.find({ where: { tenantId: tenant.tenantId, status: 'active' } });

    const runs = [];
    for (const control of controls) {
      const evidenceForControl = await this.evidence.count({ where: { tenantId: tenant.tenantId, controlId: control.id } });
      const passed = evidenceForControl > 0 || control.category === 'monitoring';
      const run = await this.controlTests.save(
        this.controlTests.create({
          tenantId: tenant.tenantId,
          controlId: control.id,
          status: passed ? 'passed' : 'failed',
          result: {
            automated: true,
            evidenceCount: evidenceForControl,
            message: passed ? 'Control satisfied' : 'Missing evidence — upload required',
          },
          executedAt: new Date(),
        }),
      );
      runs.push(run);
      if (!passed) {
        await this.raiseDriftAlert(tenant, control);
      }
    }

    await this.audit(tenant, user, 'compliance_suite.control_tests_run', 'compliance_control_test', runs[0]?.id ?? '', {
      count: runs.length,
      passed: runs.filter((r) => r.status === 'passed').length,
    });
    return runs;
  }

  async listMonitoringAlerts(tenant: TenantContext) {
    return this.monitoringAlerts.find({
      where: { tenantId: tenant.tenantId },
      order: { detectedAt: 'DESC' },
      take: 50,
    });
  }

  async listProcurementArtifacts(tenant: TenantContext) {
    await this.ensureProcurementSeeds(tenant);
    return this.procurementArtifacts.find({ where: { tenantId: tenant.tenantId }, order: { publishedAt: 'DESC' } });
  }

  async listQuestionnaires(tenant: TenantContext) {
    await this.ensureQuestionnaireSeeds(tenant);
    return this.questionnaires.find({ where: { tenantId: tenant.tenantId } });
  }

  async generateExportReport(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: GenerateExportReportDto) {
    await this.ensureDefaults(tenant);
    const [frameworks, controls, risks, incidents, auditStatus, auditExport] = await Promise.all([
      this.listFrameworks(tenant),
      this.listControls(tenant),
      this.listRisks(tenant),
      this.listIncidents(tenant),
      this.auditLogs.complianceStatus(tenant, user),
      this.auditLogs.exportCsv(tenant, { limit: 200 }, user),
    ]);

    const payload: Record<string, unknown> = {
      reportType: dto.reportType,
      generatedAt: new Date().toISOString(),
      frameworks,
      controls,
      risks,
      incidents,
      auditStatus,
      auditLogSampleCsv: dto.format === 'csv' ? auditExport : undefined,
      auditLogRows: dto.format === 'json' ? auditExport.split('\n').slice(0, 50) : undefined,
    };

    const report = await this.exportReports.save(
      this.exportReports.create({
        tenantId: tenant.tenantId,
        reportType: dto.reportType,
        format: dto.format ?? 'json',
        payload,
        generatedByUserId: user?.id ?? null,
        generatedAt: new Date(),
      }),
    );

    await this.audit(tenant, user, 'compliance_suite.report_exported', 'compliance_export_report', report.id, {
      reportType: dto.reportType,
      format: dto.format ?? 'json',
    });

    return report;
  }

  async auditorLogin(tenant: TenantContext, dto: AuditorLoginDto) {
    const user = await this.auditorUsers.findOne({
      where: { tenantId: tenant.tenantId, email: dto.email.trim().toLowerCase(), status: 'active' },
    });
    if (!user || !(await verifyPassword(dto.password, user.portalPasswordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (user.expiresAt && user.expiresAt < new Date()) {
      throw new UnauthorizedException('Auditor access expired');
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      tenantId: tenant.tenantId,
      email: user.email,
      type: 'auditor',
      auditorUserId: user.id,
    } satisfies AuditorAuthPayload);

    return {
      accessToken: token,
      tokenType: 'Bearer',
      auditor: { id: user.id, email: user.email, fullName: user.fullName, accessScope: user.accessScope },
    };
  }

  async createAuditorUser(
    tenant: TenantContext,
    adminUser: AuthenticatedUser | undefined,
    dto: CreateAuditorUserDto,
  ) {
    const existing = await this.auditorUsers.findOne({
      where: { tenantId: tenant.tenantId, email: dto.email.trim().toLowerCase() },
    });
    if (existing) throw new BadRequestException('Auditor user already exists');

    const hashed = await hashPassword(dto.password);
    const user = await this.auditorUsers.save(
      this.auditorUsers.create({
        tenantId: tenant.tenantId,
        email: dto.email.trim().toLowerCase(),
        fullName: dto.fullName?.trim() ?? '',
        portalPasswordHash: hashed,
        accessScope: { readOnly: true, frameworks: ['*'], evidence: true, policies: true },
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        status: 'active',
      }),
    );

    await this.audit(tenant, adminUser, 'compliance_suite.auditor_created', 'compliance_auditor_user', user.id, {
      email: user.email,
    });

    const { portalPasswordHash: _ignored, ...safe } = user;
    return safe;
  }

  async auditorReadonlyBundle(tenant: TenantContext) {
    return {
      frameworks: await this.listFrameworks(tenant),
      controls: await this.listControls(tenant),
      evidence: await this.listEvidence(tenant),
      policies: await this.listPolicies(tenant),
      risks: await this.listRisks(tenant),
      procurement: await this.listProcurementArtifacts(tenant),
      auditCompliance: await this.auditLogs.complianceStatus(tenant),
    };
  }

  private ensureDefaults(tenant: TenantContext): Promise<void> {
    const tenantId = tenant.tenantId;
    const inFlight = this.ensureDefaultsLocks.get(tenantId);
    if (inFlight) return inFlight;

    const run = this.seedDefaults(tenant).finally(() => {
      if (this.ensureDefaultsLocks.get(tenantId) === run) {
        this.ensureDefaultsLocks.delete(tenantId);
      }
    });
    this.ensureDefaultsLocks.set(tenantId, run);
    return run;
  }

  private async seedDefaults(tenant: TenantContext) {
    for (const seed of SEED_FRAMEWORKS) {
      const existing = await this.frameworks.findOne({
        where: { tenantId: tenant.tenantId, frameworkKey: seed.frameworkKey },
      });
      if (!existing) {
        await this.frameworks.save(
          this.frameworks.create({
            tenantId: tenant.tenantId,
            frameworkKey: seed.frameworkKey,
            displayName: seed.displayName,
            frameworkType: seed.frameworkType,
            status: 'active',
            controlCount: 0,
            metadata: {},
          }),
        );
      }
    }

    const frameworkByKey = new Map(
      (await this.frameworks.find({ where: { tenantId: tenant.tenantId } })).map((f) => [f.frameworkKey, f.id]),
    );

    for (const seed of SEED_CONTROLS) {
      const existing = await this.controls.findOne({
        where: { tenantId: tenant.tenantId, controlKey: seed.controlKey },
      });
      if (!existing) {
        await this.controls.save(
          this.controls.create({
            tenantId: tenant.tenantId,
            frameworkId: frameworkByKey.get(seed.frameworkKey) ?? null,
            controlKey: seed.controlKey,
            title: seed.title,
            description: '',
            category: seed.category,
            testFrequency: 'monthly',
            status: 'active',
            metadata: {},
          }),
        );
      }
    }

    for (const fw of await this.frameworks.find({ where: { tenantId: tenant.tenantId } })) {
      const count = await this.controls.count({ where: { tenantId: tenant.tenantId, frameworkId: fw.id } });
      fw.controlCount = count;
      await this.frameworks.save(fw);
    }

    await this.ensureSecuritySettings(tenant.tenantId);
    await this.ensureDataGovernance(tenant.tenantId);
    await this.ensureVendorSeeds(tenant);
    await this.ensureProcurementSeeds(tenant);
    await this.ensureQuestionnaireSeeds(tenant);
  }

  private async ensureSecuritySettings(tenantId: string): Promise<ComplianceSecuritySettingsEntity> {
    const existing = await this.securitySettings.findOne({ where: { tenantId } });
    if (existing) return existing;
    return this.securitySettings.save(
      this.securitySettings.create({
        tenantId,
        mfaEnforced: false,
        passwordPolicy: {
          minLength: 12,
          requireUppercase: true,
          requireNumber: true,
          requireSymbol: true,
          rotationDays: 90,
        },
        sessionPolicy: { maxSessionMinutes: 480, idleTimeoutMinutes: 30, concurrentSessions: 3 },
        deviceTrustRules: [{ rule: 'managed_device_required', enabled: false }],
        ipAllowlist: [],
        ssoConfig: { supported: ['saml', 'oauth', 'scim'], note: 'Configure via Auth > SSO' },
        scimEnabled: false,
      }),
    );
  }

  private async ensureDataGovernance(tenantId: string): Promise<ComplianceDataGovernanceEntity> {
    const existing = await this.dataGovernance.findOne({ where: { tenantId } });
    if (existing) return existing;
    return this.dataGovernance.save(
      this.dataGovernance.create({
        tenantId,
        classificationRules: [
          { level: 'public', description: 'Marketing content' },
          { level: 'internal', description: 'Operational data' },
          { level: 'confidential', description: 'Business sensitive' },
          { level: 'restricted', description: 'PII / payment data' },
        ],
        piiMasking: { email: 'partial', phone: 'last4', card: 'tokenize' },
        encryptionPolicy: { atRest: 'AES-256', inTransit: 'TLS 1.2+', keyRotationDays: 90 },
        retentionRules: [
          { dataType: 'audit_logs', days: 365 },
          { dataType: 'orders', days: 2555 },
          { dataType: 'marketing', days: 730 },
        ],
        residencyPolicy: { defaultRegion: 'EU', allowedRegions: ['EU', 'UK'], enforceResidency: true },
      }),
    );
  }

  private async ensureVendorSeeds(tenant: TenantContext) {
    const seeds = [
      { vendorKey: 'stripe', name: 'Stripe', category: 'payments', riskTier: 'high' },
      { vendorKey: 'aws', name: 'Amazon Web Services', category: 'infrastructure', riskTier: 'high' },
      { vendorKey: 'sendgrid', name: 'SendGrid', category: 'communications', riskTier: 'medium' },
    ];
    for (const seed of seeds) {
      const existing = await this.vendors.findOne({ where: { tenantId: tenant.tenantId, vendorKey: seed.vendorKey } });
      if (!existing) {
        await this.vendors.save(
          this.vendors.create({
            tenantId: tenant.tenantId,
            vendorKey: seed.vendorKey,
            name: seed.name,
            category: seed.category,
            riskTier: seed.riskTier,
            status: 'active',
            assessment: { lastReview: null, soc2: 'pending' },
            metadata: {},
          }),
        );
      }
    }
  }

  private async ensureProcurementSeeds(tenant: TenantContext) {
    const seeds = [
      { artifactType: 'pentest_report', title: 'Annual Penetration Test Report', version: '2025-Q4' },
      { artifactType: 'sla_report', title: 'Platform Uptime & SLA Report', version: '2026-05' },
      { artifactType: 'compliance_pack', title: 'Enterprise Compliance Documentation Pack', version: '1.2' },
    ];
    for (const seed of seeds) {
      const existing = await this.procurementArtifacts.findOne({
        where: { tenantId: tenant.tenantId, artifactType: seed.artifactType, title: seed.title },
      });
      if (!existing) {
        await this.procurementArtifacts.save(
          this.procurementArtifacts.create({
            tenantId: tenant.tenantId,
            artifactType: seed.artifactType,
            title: seed.title,
            version: seed.version,
            storageUri: `compliance://${tenant.tenantId}/artifacts/${seed.artifactType}`,
            status: 'published',
            metadata: {},
            publishedAt: new Date(),
          }),
        );
      }
    }
  }

  private async ensureQuestionnaireSeeds(tenant: TenantContext) {
    const existing = await this.questionnaires.findOne({
      where: { tenantId: tenant.tenantId, questionnaireKey: 'sig-lite' },
    });
    if (!existing) {
      await this.questionnaires.save(
        this.questionnaires.create({
          tenantId: tenant.tenantId,
          questionnaireKey: 'sig-lite',
          title: 'SIG Lite Security Questionnaire',
          responses: {
            encryption_at_rest: 'AES-256',
            mfa_available: true,
            incident_response: 'Documented IR playbook with 24h SLA',
          },
          autoFillRate: 78.5,
          status: 'published',
        }),
      );
    }
  }

  private buildRiskHeatmap(risks: ComplianceRiskEntity[]) {
    const matrix: Record<string, number> = {};
    for (const risk of risks) {
      const key = `${risk.likelihood}x${risk.impact}`;
      matrix[key] = (matrix[key] ?? 0) + 1;
    }
    return { matrix, topRisks: risks.slice(0, 5).map((r) => ({ id: r.id, title: r.title, score: r.residualScore })) };
  }

  private async raiseDriftAlert(tenant: TenantContext, control: ComplianceControlEntity) {
    await this.monitoringAlerts.save(
      this.monitoringAlerts.create({
        tenantId: tenant.tenantId,
        alertType: 'compliance_drift',
        severity: 'high',
        title: `Control drift: ${control.controlKey}`,
        description: `Automated test failed for ${control.title}`,
        status: 'open',
        source: 'control_test',
        metadata: { controlId: control.id },
        detectedAt: new Date(),
        resolvedAt: null,
      }),
    );
  }

  private async audit(
    tenant: TenantContext,
    user: AuthenticatedUser | undefined,
    action: string,
    entityType: string,
    entityId: string,
    metadata: Record<string, unknown>,
  ) {
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id ?? null,
      actorType: user ? 'staff' : 'system',
      source: 'compliance_suite',
      action,
      entityType,
      entityId,
      metadata,
      riskLevel: action.includes('incident') ? 'high' : 'medium',
    });
  }
}
