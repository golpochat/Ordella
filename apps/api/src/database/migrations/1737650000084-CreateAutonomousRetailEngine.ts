import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAutonomousRetailEngine1737650000084 implements MigrationInterface {
  name = 'CreateAutonomousRetailEngine1737650000084';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS autonomous_policies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
        mode VARCHAR(32) NOT NULL DEFAULT 'semi_autonomous',
        pricing_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        replenishment_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        staffing_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        promotion_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        delivery_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        overrides JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, location_id)
      );

      CREATE TABLE IF NOT EXISTS autonomous_decision_models (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        model_type VARCHAR(32) NOT NULL,
        version INT NOT NULL DEFAULT 1,
        display_name VARCHAR(180) NOT NULL,
        config JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        published_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, model_type, version)
      );

      CREATE TABLE IF NOT EXISTS autonomous_safety_constraints (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        constraint_key VARCHAR(64) NOT NULL,
        display_name VARCHAR(180) NOT NULL,
        rules JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, constraint_key)
      );

      CREATE TABLE IF NOT EXISTS autonomous_decisions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
        model_type VARCHAR(32) NOT NULL,
        action_type VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        confidence DECIMAL(6,4) NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}',
        explanation TEXT NOT NULL,
        predicted_impact JSONB NOT NULL DEFAULT '{}',
        alternatives_considered JSONB NOT NULL DEFAULT '[]',
        twin_simulation_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_autonomous_decisions_tenant ON autonomous_decisions (tenant_id, status, created_at DESC);

      CREATE TABLE IF NOT EXISTS autonomous_actions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        decision_id UUID REFERENCES autonomous_decisions(id) ON DELETE SET NULL,
        location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
        action_type VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}',
        rollback_payload JSONB,
        executed_by VARCHAR(32) NOT NULL DEFAULT 'system',
        approved_by_user_id UUID,
        error_message TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        executed_at TIMESTAMPTZ,
        rolled_back_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_autonomous_actions_tenant ON autonomous_actions (tenant_id, created_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS autonomous_actions;
      DROP TABLE IF EXISTS autonomous_decisions;
      DROP TABLE IF EXISTS autonomous_safety_constraints;
      DROP TABLE IF EXISTS autonomous_decision_models;
      DROP TABLE IF EXISTS autonomous_policies;
    `);
  }
}
