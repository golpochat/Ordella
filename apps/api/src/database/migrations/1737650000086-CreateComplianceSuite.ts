import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateComplianceSuite1737650000086 implements MigrationInterface {
  name = 'CreateComplianceSuite1737650000086';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS compliance_frameworks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        framework_key VARCHAR(64) NOT NULL,
        display_name VARCHAR(180) NOT NULL,
        framework_type VARCHAR(32) NOT NULL DEFAULT 'security',
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        control_count INT NOT NULL DEFAULT 0,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, framework_key)
      );

      CREATE TABLE IF NOT EXISTS compliance_controls (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        framework_id UUID REFERENCES compliance_frameworks(id) ON DELETE SET NULL,
        control_key VARCHAR(96) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        category VARCHAR(64) NOT NULL DEFAULT 'general',
        test_frequency VARCHAR(32) NOT NULL DEFAULT 'monthly',
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, control_key)
      );
      CREATE INDEX IF NOT EXISTS idx_compliance_controls_framework ON compliance_controls (tenant_id, framework_id);

      CREATE TABLE IF NOT EXISTS compliance_risks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        risk_key VARCHAR(96) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        likelihood INT NOT NULL DEFAULT 3,
        impact INT NOT NULL DEFAULT 3,
        inherent_score INT NOT NULL DEFAULT 9,
        residual_score INT NOT NULL DEFAULT 9,
        status VARCHAR(32) NOT NULL DEFAULT 'open',
        owner_user_id UUID,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, risk_key)
      );

      CREATE TABLE IF NOT EXISTS compliance_evidence (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        control_id UUID REFERENCES compliance_controls(id) ON DELETE SET NULL,
        evidence_type VARCHAR(64) NOT NULL DEFAULT 'document',
        title VARCHAR(255) NOT NULL,
        storage_uri VARCHAR(512) NOT NULL DEFAULT '',
        collected_by_user_id UUID,
        collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        status VARCHAR(32) NOT NULL DEFAULT 'submitted',
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_compliance_evidence_control ON compliance_evidence (tenant_id, control_id);

      CREATE TABLE IF NOT EXISTS compliance_control_test_runs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        control_id UUID NOT NULL REFERENCES compliance_controls(id) ON DELETE CASCADE,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        result JSONB NOT NULL DEFAULT '{}'::jsonb,
        executed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_compliance_control_tests ON compliance_control_test_runs (tenant_id, control_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS compliance_policy_versions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        policy_key VARCHAR(96) NOT NULL,
        version INT NOT NULL DEFAULT 1,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL DEFAULT '',
        status VARCHAR(32) NOT NULL DEFAULT 'draft',
        published_at TIMESTAMPTZ,
        published_by_user_id UUID,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, policy_key, version)
      );

      CREATE TABLE IF NOT EXISTS compliance_incidents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        incident_key VARCHAR(96) NOT NULL,
        title VARCHAR(255) NOT NULL,
        severity VARCHAR(32) NOT NULL DEFAULT 'medium',
        status VARCHAR(32) NOT NULL DEFAULT 'open',
        reported_by_user_id UUID,
        assigned_to_user_id UUID,
        description TEXT NOT NULL DEFAULT '',
        timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
        resolved_at TIMESTAMPTZ,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, incident_key)
      );

      CREATE TABLE IF NOT EXISTS compliance_vendors (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        vendor_key VARCHAR(96) NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(64) NOT NULL DEFAULT 'saas',
        risk_tier VARCHAR(32) NOT NULL DEFAULT 'medium',
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        assessment JSONB NOT NULL DEFAULT '{}'::jsonb,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, vendor_key)
      );

      CREATE TABLE IF NOT EXISTS compliance_security_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        mfa_enforced BOOLEAN NOT NULL DEFAULT FALSE,
        password_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
        session_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
        device_trust_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
        ip_allowlist JSONB NOT NULL DEFAULT '[]'::jsonb,
        sso_config JSONB NOT NULL DEFAULT '{}'::jsonb,
        scim_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id)
      );

      CREATE TABLE IF NOT EXISTS compliance_data_governance (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        classification_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
        pii_masking JSONB NOT NULL DEFAULT '{}'::jsonb,
        encryption_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
        retention_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
        residency_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id)
      );

      CREATE TABLE IF NOT EXISTS compliance_data_access_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID,
        resource_type VARCHAR(64) NOT NULL,
        resource_id VARCHAR(128),
        action VARCHAR(64) NOT NULL,
        classification VARCHAR(32) NOT NULL DEFAULT 'internal',
        ip_address VARCHAR(64),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_compliance_data_access ON compliance_data_access_logs (tenant_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS compliance_auditor_users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        full_name VARCHAR(160) NOT NULL DEFAULT '',
        portal_password_hash VARCHAR(255) NOT NULL,
        access_scope JSONB NOT NULL DEFAULT '{}'::jsonb,
        expires_at TIMESTAMPTZ,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, email)
      );

      CREATE TABLE IF NOT EXISTS compliance_procurement_artifacts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        artifact_type VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        version VARCHAR(32) NOT NULL DEFAULT '1.0',
        storage_uri VARCHAR(512) NOT NULL DEFAULT '',
        status VARCHAR(32) NOT NULL DEFAULT 'published',
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS compliance_questionnaires (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        questionnaire_key VARCHAR(96) NOT NULL,
        title VARCHAR(255) NOT NULL,
        responses JSONB NOT NULL DEFAULT '{}'::jsonb,
        auto_fill_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
        status VARCHAR(32) NOT NULL DEFAULT 'draft',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, questionnaire_key)
      );

      CREATE TABLE IF NOT EXISTS compliance_monitoring_alerts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        alert_type VARCHAR(64) NOT NULL,
        severity VARCHAR(32) NOT NULL DEFAULT 'medium',
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        status VARCHAR(32) NOT NULL DEFAULT 'open',
        source VARCHAR(64) NOT NULL DEFAULT 'internal',
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_compliance_monitoring ON compliance_monitoring_alerts (tenant_id, status, detected_at DESC);

      CREATE TABLE IF NOT EXISTS compliance_export_reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        report_type VARCHAR(64) NOT NULL,
        format VARCHAR(16) NOT NULL DEFAULT 'json',
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        generated_by_user_id UUID,
        generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS compliance_export_reports;
      DROP TABLE IF EXISTS compliance_monitoring_alerts;
      DROP TABLE IF EXISTS compliance_questionnaires;
      DROP TABLE IF EXISTS compliance_procurement_artifacts;
      DROP TABLE IF EXISTS compliance_auditor_users;
      DROP TABLE IF EXISTS compliance_data_access_logs;
      DROP TABLE IF EXISTS compliance_data_governance;
      DROP TABLE IF EXISTS compliance_security_settings;
      DROP TABLE IF EXISTS compliance_vendors;
      DROP TABLE IF EXISTS compliance_incidents;
      DROP TABLE IF EXISTS compliance_policy_versions;
      DROP TABLE IF EXISTS compliance_control_test_runs;
      DROP TABLE IF EXISTS compliance_evidence;
      DROP TABLE IF EXISTS compliance_risks;
      DROP TABLE IF EXISTS compliance_controls;
      DROP TABLE IF EXISTS compliance_frameworks;
    `);
  }
}
