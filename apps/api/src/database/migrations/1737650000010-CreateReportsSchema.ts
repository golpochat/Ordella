import { MigrationInterface, QueryRunner } from 'typeorm';

/** SRS §14 + API Spec §12 — report_definitions, reports, report_jobs, report_results */
export class CreateReportsSchema1737650000010 implements MigrationInterface {
  name = 'CreateReportsSchema1737650000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS report_definitions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        slug VARCHAR(64) NOT NULL UNIQUE,
        name VARCHAR(128) NOT NULL,
        description TEXT,
        parameters_schema JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        definition_id UUID NOT NULL REFERENCES report_definitions(id) ON DELETE RESTRICT,
        name VARCHAR(128),
        parameters JSONB NOT NULL DEFAULT '{}',
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
        requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_reports_tenant_definition ON reports (tenant_id, definition_id);
      CREATE INDEX IF NOT EXISTS idx_reports_tenant_status ON reports (tenant_id, status);

      CREATE TABLE IF NOT EXISTS report_jobs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
        definition_id UUID NOT NULL REFERENCES report_definitions(id) ON DELETE RESTRICT,
        format VARCHAR(16) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'queued',
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        error_message TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_report_jobs_tenant_status ON report_jobs (tenant_id, status);
      CREATE INDEX IF NOT EXISTS idx_report_jobs_report_created ON report_jobs (report_id, created_at);

      CREATE TABLE IF NOT EXISTS report_results (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        job_id UUID NOT NULL REFERENCES report_jobs(id) ON DELETE CASCADE,
        format VARCHAR(16) NOT NULL,
        storage_ref VARCHAR(512),
        summary JSONB NOT NULL DEFAULT '{}',
        row_count INT,
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_report_results_job_id ON report_results (job_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS report_results;
      DROP TABLE IF EXISTS report_jobs;
      DROP TABLE IF EXISTS reports;
      DROP TABLE IF EXISTS report_definitions;
    `);
  }
}
