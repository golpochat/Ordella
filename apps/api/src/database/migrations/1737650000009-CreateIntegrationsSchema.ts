import { MigrationInterface, QueryRunner } from 'typeorm';

/** API Spec §13 + SRS §59 — integrations, integration_providers, integration_events, integration_logs */
export class CreateIntegrationsSchema1737650000009 implements MigrationInterface {
  name = 'CreateIntegrationsSchema1737650000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS integration_providers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        slug VARCHAR(64) NOT NULL UNIQUE,
        name VARCHAR(128) NOT NULL,
        category VARCHAR(32) NOT NULL,
        config_schema JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS integrations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        provider_id UUID NOT NULL REFERENCES integration_providers(id) ON DELETE RESTRICT,
        name VARCHAR(128) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        config JSONB NOT NULL DEFAULT '{}',
        credentials_ref VARCHAR(255),
        webhook_secret VARCHAR(255),
        connected_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_integrations_tenant_provider ON integrations (tenant_id, provider_id);

      CREATE TABLE IF NOT EXISTS integration_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
        event_type VARCHAR(128) NOT NULL,
        external_id VARCHAR(255),
        payload JSONB NOT NULL DEFAULT '{}',
        status VARCHAR(32) NOT NULL DEFAULT 'received',
        processed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_integration_events_integration_created ON integration_events (integration_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_integration_events_type_status ON integration_events (event_type, status);

      CREATE TABLE IF NOT EXISTS integration_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
        level VARCHAR(16) NOT NULL,
        action VARCHAR(64) NOT NULL,
        message TEXT,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_integration_logs_integration_created ON integration_logs (integration_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_integration_logs_tenant_level ON integration_logs (tenant_id, level);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS integration_logs;
      DROP TABLE IF EXISTS integration_events;
      DROP TABLE IF EXISTS integrations;
      DROP TABLE IF EXISTS integration_providers;
    `);
  }
}
