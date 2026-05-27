import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrchestrationEngine1737650000082 implements MigrationInterface {
  name = 'CreateOrchestrationEngine1737650000082';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(180) NOT NULL,
        description TEXT,
        status VARCHAR(32) NOT NULL DEFAULT 'draft',
        current_version INT NOT NULL DEFAULT 1,
        sandbox_mode BOOLEAN NOT NULL DEFAULT FALSE,
        allowed_roles TEXT[] NOT NULL DEFAULT '{}',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_workflows_tenant ON workflows (tenant_id, status);

      CREATE TABLE IF NOT EXISTS workflow_versions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
        version INT NOT NULL,
        canvas_definition JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[]}',
        published_at TIMESTAMPTZ,
        created_by UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, workflow_id, version)
      );

      CREATE TABLE IF NOT EXISTS workflow_steps (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
        workflow_version_id UUID NOT NULL REFERENCES workflow_versions(id) ON DELETE CASCADE,
        step_key VARCHAR(64) NOT NULL,
        step_type VARCHAR(32) NOT NULL,
        label VARCHAR(180) NOT NULL,
        step_order INT NOT NULL,
        config JSONB NOT NULL DEFAULT '{}',
        branch_group VARCHAR(64),
        parallel_group VARCHAR(64),
        on_error_path VARCHAR(64),
        next_on_success VARCHAR(64),
        next_on_failure VARCHAR(64),
        max_retries INT NOT NULL DEFAULT 3,
        metadata JSONB NOT NULL DEFAULT '{}',
        UNIQUE (tenant_id, workflow_version_id, step_key)
      );

      CREATE TABLE IF NOT EXISTS workflow_triggers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
        trigger_type VARCHAR(32) NOT NULL,
        config JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        last_fired_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_workflow_triggers_tenant ON workflow_triggers (tenant_id, workflow_id, trigger_type);

      CREATE TABLE IF NOT EXISTS workflow_runs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
        workflow_version_id UUID NOT NULL REFERENCES workflow_versions(id) ON DELETE CASCADE,
        version INT NOT NULL,
        status VARCHAR(32) NOT NULL,
        trigger_type VARCHAR(32) NOT NULL,
        idempotency_key VARCHAR(160),
        sandbox_run BOOLEAN NOT NULL DEFAULT FALSE,
        context JSONB NOT NULL DEFAULT '{}',
        started_at TIMESTAMPTZ NOT NULL,
        finished_at TIMESTAMPTZ,
        error_message TEXT,
        metrics JSONB NOT NULL DEFAULT '{}'
      );
      CREATE INDEX IF NOT EXISTS idx_workflow_runs_tenant ON workflow_runs (tenant_id, workflow_id, started_at DESC);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_workflow_runs_idempotency ON workflow_runs (tenant_id, idempotency_key) WHERE idempotency_key IS NOT NULL;

      CREATE TABLE IF NOT EXISTS workflow_step_runs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        workflow_run_id UUID NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
        workflow_step_id UUID NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
        step_key VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL,
        attempt_count INT NOT NULL DEFAULT 0,
        input JSONB NOT NULL DEFAULT '{}',
        output JSONB NOT NULL DEFAULT '{}',
        logs JSONB NOT NULL DEFAULT '[]',
        error_trace TEXT,
        idempotency_key VARCHAR(160),
        started_at TIMESTAMPTZ,
        finished_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_workflow_step_runs_run ON workflow_step_runs (tenant_id, workflow_run_id);

      CREATE TABLE IF NOT EXISTS workflow_approvals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        workflow_run_id UUID NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
        workflow_step_run_id UUID NOT NULL REFERENCES workflow_step_runs(id) ON DELETE CASCADE,
        assignee_user_id UUID NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        comment TEXT,
        escalation_level INT NOT NULL DEFAULT 0,
        escalate_after_minutes INT NOT NULL DEFAULT 60,
        due_at TIMESTAMPTZ,
        resolved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_workflow_approvals_inbox ON workflow_approvals (tenant_id, assignee_user_id, status);

      CREATE TABLE IF NOT EXISTS workflow_dead_letters (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        workflow_run_id UUID NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
        workflow_step_run_id UUID NOT NULL REFERENCES workflow_step_runs(id) ON DELETE CASCADE,
        status VARCHAR(24) NOT NULL DEFAULT 'open',
        error_message TEXT NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}',
        attempts INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_workflow_dead_letters_tenant ON workflow_dead_letters (tenant_id, status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS workflow_dead_letters;
      DROP TABLE IF EXISTS workflow_approvals;
      DROP TABLE IF EXISTS workflow_step_runs;
      DROP TABLE IF EXISTS workflow_runs;
      DROP TABLE IF EXISTS workflow_triggers;
      DROP TABLE IF EXISTS workflow_steps;
      DROP TABLE IF EXISTS workflow_versions;
      DROP TABLE IF EXISTS workflows;
    `);
  }
}
