import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDigitalTwinsSystem1737650000083 implements MigrationInterface {
  name = 'CreateDigitalTwinsSystem1737650000083';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS digital_twin_models (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(180) NOT NULL,
        description TEXT,
        twin_type VARCHAR(64) NOT NULL,
        entity_ref_id UUID,
        current_version INT NOT NULL DEFAULT 1,
        baseline_data JSONB NOT NULL DEFAULT '{}',
        simulation_parameters JSONB NOT NULL DEFAULT '{}',
        allowed_roles TEXT[] NOT NULL DEFAULT '{manager,admin}',
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_digital_twin_models_tenant ON digital_twin_models (tenant_id, twin_type);

      CREATE TABLE IF NOT EXISTS digital_twin_versions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        twin_id UUID NOT NULL REFERENCES digital_twin_models(id) ON DELETE CASCADE,
        version INT NOT NULL,
        baseline_data JSONB NOT NULL DEFAULT '{}',
        simulation_parameters JSONB NOT NULL DEFAULT '{}',
        published_at TIMESTAMPTZ,
        created_by UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, twin_id, version)
      );

      CREATE TABLE IF NOT EXISTS simulation_scenarios (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        twin_id UUID NOT NULL REFERENCES digital_twin_models(id) ON DELETE CASCADE,
        name VARCHAR(180) NOT NULL,
        description TEXT,
        parameters JSONB NOT NULL DEFAULT '{}',
        forecast_overrides JSONB NOT NULL DEFAULT '{}',
        extreme_conditions JSONB NOT NULL DEFAULT '{}',
        is_baseline BOOLEAN NOT NULL DEFAULT FALSE,
        metadata JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, twin_id, name)
      );

      CREATE TABLE IF NOT EXISTS simulation_runs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        twin_id UUID NOT NULL REFERENCES digital_twin_models(id) ON DELETE CASCADE,
        scenario_id UUID REFERENCES simulation_scenarios(id) ON DELETE SET NULL,
        simulation_domain VARCHAR(64) NOT NULL DEFAULT 'full',
        status VARCHAR(32) NOT NULL,
        reproducibility_seed VARCHAR(64) NOT NULL,
        cache_key VARCHAR(128),
        batch_id UUID,
        sandbox_mode BOOLEAN NOT NULL DEFAULT TRUE,
        parameters JSONB NOT NULL DEFAULT '{}',
        started_at TIMESTAMPTZ NOT NULL,
        finished_at TIMESTAMPTZ,
        error_message TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_simulation_runs_tenant ON simulation_runs (tenant_id, twin_id, started_at DESC);

      CREATE TABLE IF NOT EXISTS simulation_results (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        simulation_run_id UUID NOT NULL REFERENCES simulation_runs(id) ON DELETE CASCADE,
        kpis JSONB NOT NULL DEFAULT '{}',
        charts JSONB NOT NULL DEFAULT '[]',
        metrics JSONB NOT NULL DEFAULT '{}',
        baseline_deltas JSONB NOT NULL DEFAULT '{}',
        risk_analysis JSONB NOT NULL DEFAULT '[]',
        recommended_actions JSONB NOT NULL DEFAULT '[]',
        confidence_intervals JSONB NOT NULL DEFAULT '{}',
        ai_explanation TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, simulation_run_id)
      );

      CREATE TABLE IF NOT EXISTS simulation_cache (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        cache_key VARCHAR(128) NOT NULL,
        simulation_run_id UUID NOT NULL REFERENCES simulation_runs(id) ON DELETE CASCADE,
        result_hash VARCHAR(64) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, cache_key)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS simulation_cache;
      DROP TABLE IF EXISTS simulation_results;
      DROP TABLE IF EXISTS simulation_runs;
      DROP TABLE IF EXISTS simulation_scenarios;
      DROP TABLE IF EXISTS digital_twin_versions;
      DROP TABLE IF EXISTS digital_twin_models;
    `);
  }
}
