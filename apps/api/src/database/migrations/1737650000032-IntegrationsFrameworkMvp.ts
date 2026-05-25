import { MigrationInterface, QueryRunner } from 'typeorm';

export class IntegrationsFrameworkMvp1737650000032 implements MigrationInterface {
  name = 'IntegrationsFrameworkMvp1737650000032';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE api_keys
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        url VARCHAR(2048) NOT NULL,
        secret VARCHAR(255) NOT NULL,
        events JSONB NOT NULL DEFAULT '[]',
        is_active BOOLEAN NOT NULL DEFAULT true,
        last_delivery_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_webhooks_tenant_active
      ON webhooks (tenant_id, is_active)
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS webhook_delivery_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
        event_type VARCHAR(128) NOT NULL,
        attempt INTEGER NOT NULL DEFAULT 1,
        status_code INTEGER,
        response_body TEXT,
        success BOOLEAN NOT NULL DEFAULT false,
        payload JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_delivery_logs_tenant_created
      ON webhook_delivery_logs (tenant_id, created_at DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_delivery_logs_webhook_created
      ON webhook_delivery_logs (webhook_id, created_at DESC)
    `);
    await queryRunner.query(`
      INSERT INTO permissions (key, description)
      VALUES
        ('integrations:read', 'Read integration settings'),
        ('integrations:create', 'Create integration settings'),
        ('integrations:update', 'Update integration settings'),
        ('integrations:delete', 'Delete integration settings'),
        ('integration-events:read', 'Read integration events'),
        ('integration-logs:read', 'Read integration logs'),
        ('api-keys:read', 'Read API keys'),
        ('api-keys:create', 'Create API keys'),
        ('api-keys:delete', 'Revoke API keys')
      ON CONFLICT (key) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_webhook_delivery_logs_webhook_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_webhook_delivery_logs_tenant_created`);
    await queryRunner.query(`DROP TABLE IF EXISTS webhook_delivery_logs`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_webhooks_tenant_active`);
    await queryRunner.query(`DROP TABLE IF EXISTS webhooks`);
    await queryRunner.query(`ALTER TABLE api_keys DROP COLUMN IF EXISTS is_active`);
  }
}
