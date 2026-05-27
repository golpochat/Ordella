import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('compliance_frameworks')
@Index(['tenantId', 'frameworkKey'], { unique: true })
export class ComplianceFrameworkEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'framework_key', type: 'varchar', length: 64 })
  frameworkKey!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 180 })
  displayName!: string;

  @Column({ name: 'framework_type', type: 'varchar', length: 32, default: 'security' })
  frameworkType!: string;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status!: string;

  @Column({ name: 'control_count', type: 'int', default: 0 })
  controlCount!: number;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('compliance_controls')
@Index(['tenantId', 'controlKey'], { unique: true })
export class ComplianceControlEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'framework_id', type: 'uuid', nullable: true })
  frameworkId!: string | null;

  @Column({ name: 'control_key', type: 'varchar', length: 96 })
  controlKey!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'varchar', length: 64, default: 'general' })
  category!: string;

  @Column({ name: 'test_frequency', type: 'varchar', length: 32, default: 'monthly' })
  testFrequency!: string;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('compliance_risks')
@Index(['tenantId', 'riskKey'], { unique: true })
export class ComplianceRiskEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'risk_key', type: 'varchar', length: 96 })
  riskKey!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'int', default: 3 })
  likelihood!: number;

  @Column({ type: 'int', default: 3 })
  impact!: number;

  @Column({ name: 'inherent_score', type: 'int', default: 9 })
  inherentScore!: number;

  @Column({ name: 'residual_score', type: 'int', default: 9 })
  residualScore!: number;

  @Column({ type: 'varchar', length: 32, default: 'open' })
  status!: string;

  @Column({ name: 'owner_user_id', type: 'uuid', nullable: true })
  ownerUserId!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('compliance_evidence')
@Index(['tenantId', 'controlId'])
export class ComplianceEvidenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'control_id', type: 'uuid', nullable: true })
  controlId!: string | null;

  @Column({ name: 'evidence_type', type: 'varchar', length: 64, default: 'document' })
  evidenceType!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ name: 'storage_uri', type: 'varchar', length: 512, default: '' })
  storageUri!: string;

  @Column({ name: 'collected_by_user_id', type: 'uuid', nullable: true })
  collectedByUserId!: string | null;

  @Column({ name: 'collected_at', type: 'timestamptz', default: () => 'NOW()' })
  collectedAt!: Date;

  @Column({ type: 'varchar', length: 32, default: 'submitted' })
  status!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}

@Entity('compliance_control_test_runs')
@Index(['tenantId', 'controlId', 'createdAt'])
export class ComplianceControlTestRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'control_id', type: 'uuid' })
  controlId!: string;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  result!: Record<string, unknown>;

  @Column({ name: 'executed_at', type: 'timestamptz', nullable: true })
  executedAt!: Date | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}

@Entity('compliance_policy_versions')
@Index(['tenantId', 'policyKey', 'version'], { unique: true })
export class CompliancePolicyVersionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'policy_key', type: 'varchar', length: 96 })
  policyKey!: string;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', default: '' })
  content!: string;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status!: string;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ name: 'published_by_user_id', type: 'uuid', nullable: true })
  publishedByUserId!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('compliance_incidents')
@Index(['tenantId', 'incidentKey'], { unique: true })
export class ComplianceIncidentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'incident_key', type: 'varchar', length: 96 })
  incidentKey!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 32, default: 'medium' })
  severity!: string;

  @Column({ type: 'varchar', length: 32, default: 'open' })
  status!: string;

  @Column({ name: 'reported_by_user_id', type: 'uuid', nullable: true })
  reportedByUserId!: string | null;

  @Column({ name: 'assigned_to_user_id', type: 'uuid', nullable: true })
  assignedToUserId!: string | null;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  timeline!: unknown[];

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt!: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('compliance_vendors')
@Index(['tenantId', 'vendorKey'], { unique: true })
export class ComplianceVendorEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'vendor_key', type: 'varchar', length: 96 })
  vendorKey!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 64, default: 'saas' })
  category!: string;

  @Column({ name: 'risk_tier', type: 'varchar', length: 32, default: 'medium' })
  riskTier!: string;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  assessment!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('compliance_security_settings')
@Index(['tenantId'], { unique: true })
export class ComplianceSecuritySettingsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'mfa_enforced', type: 'boolean', default: false })
  mfaEnforced!: boolean;

  @Column({ name: 'password_policy', type: 'jsonb', default: () => "'{}'" })
  passwordPolicy!: Record<string, unknown>;

  @Column({ name: 'session_policy', type: 'jsonb', default: () => "'{}'" })
  sessionPolicy!: Record<string, unknown>;

  @Column({ name: 'device_trust_rules', type: 'jsonb', default: () => "'[]'" })
  deviceTrustRules!: unknown[];

  @Column({ name: 'ip_allowlist', type: 'jsonb', default: () => "'[]'" })
  ipAllowlist!: string[];

  @Column({ name: 'sso_config', type: 'jsonb', default: () => "'{}'" })
  ssoConfig!: Record<string, unknown>;

  @Column({ name: 'scim_enabled', type: 'boolean', default: false })
  scimEnabled!: boolean;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('compliance_data_governance')
@Index(['tenantId'], { unique: true })
export class ComplianceDataGovernanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'classification_rules', type: 'jsonb', default: () => "'[]'" })
  classificationRules!: unknown[];

  @Column({ name: 'pii_masking', type: 'jsonb', default: () => "'{}'" })
  piiMasking!: Record<string, unknown>;

  @Column({ name: 'encryption_policy', type: 'jsonb', default: () => "'{}'" })
  encryptionPolicy!: Record<string, unknown>;

  @Column({ name: 'retention_rules', type: 'jsonb', default: () => "'[]'" })
  retentionRules!: unknown[];

  @Column({ name: 'residency_policy', type: 'jsonb', default: () => "'{}'" })
  residencyPolicy!: Record<string, unknown>;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('compliance_data_access_logs')
@Index(['tenantId', 'createdAt'])
export class ComplianceDataAccessLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ name: 'resource_type', type: 'varchar', length: 64 })
  resourceType!: string;

  @Column({ name: 'resource_id', type: 'varchar', length: 128, nullable: true })
  resourceId!: string | null;

  @Column({ type: 'varchar', length: 64 })
  action!: string;

  @Column({ type: 'varchar', length: 32, default: 'internal' })
  classification!: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ipAddress!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}

@Entity('compliance_auditor_users')
@Index(['tenantId', 'email'], { unique: true })
export class ComplianceAuditorUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 160, default: '' })
  fullName!: string;

  @Column({ name: 'portal_password_hash', type: 'varchar', length: 255 })
  portalPasswordHash!: string;

  @Column({ name: 'access_scope', type: 'jsonb', default: () => "'{}'" })
  accessScope!: Record<string, unknown>;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}

@Entity('compliance_procurement_artifacts')
export class ComplianceProcurementArtifactEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'artifact_type', type: 'varchar', length: 64 })
  artifactType!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 32, default: '1.0' })
  version!: string;

  @Column({ name: 'storage_uri', type: 'varchar', length: 512, default: '' })
  storageUri!: string;

  @Column({ type: 'varchar', length: 32, default: 'published' })
  status!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'published_at', type: 'timestamptz', default: () => 'NOW()' })
  publishedAt!: Date;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}

@Entity('compliance_questionnaires')
@Index(['tenantId', 'questionnaireKey'], { unique: true })
export class ComplianceQuestionnaireEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'questionnaire_key', type: 'varchar', length: 96 })
  questionnaireKey!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  responses!: Record<string, unknown>;

  @Column({ name: 'auto_fill_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  autoFillRate!: number;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status!: string;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('compliance_monitoring_alerts')
@Index(['tenantId', 'status', 'detectedAt'])
export class ComplianceMonitoringAlertEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'alert_type', type: 'varchar', length: 64 })
  alertType!: string;

  @Column({ type: 'varchar', length: 32, default: 'medium' })
  severity!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'varchar', length: 32, default: 'open' })
  status!: string;

  @Column({ type: 'varchar', length: 64, default: 'internal' })
  source!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'detected_at', type: 'timestamptz', default: () => 'NOW()' })
  detectedAt!: Date;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt!: Date | null;
}

@Entity('compliance_export_reports')
export class ComplianceExportReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'report_type', type: 'varchar', length: 64 })
  reportType!: string;

  @Column({ type: 'varchar', length: 16, default: 'json' })
  format!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  payload!: Record<string, unknown>;

  @Column({ name: 'generated_by_user_id', type: 'uuid', nullable: true })
  generatedByUserId!: string | null;

  @Column({ name: 'generated_at', type: 'timestamptz', default: () => 'NOW()' })
  generatedAt!: Date;
}

export const COMPLIANCE_SUITE_ENTITIES = [
  ComplianceFrameworkEntity,
  ComplianceControlEntity,
  ComplianceRiskEntity,
  ComplianceEvidenceEntity,
  ComplianceControlTestRunEntity,
  CompliancePolicyVersionEntity,
  ComplianceIncidentEntity,
  ComplianceVendorEntity,
  ComplianceSecuritySettingsEntity,
  ComplianceDataGovernanceEntity,
  ComplianceDataAccessLogEntity,
  ComplianceAuditorUserEntity,
  ComplianceProcurementArtifactEntity,
  ComplianceQuestionnaireEntity,
  ComplianceMonitoringAlertEntity,
  ComplianceExportReportEntity,
];
