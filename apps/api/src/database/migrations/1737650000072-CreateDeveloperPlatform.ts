import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDeveloperPlatform1737650000072 implements MigrationInterface {
  name = 'CreateDeveloperPlatform1737650000072';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS rate_limit_per_minute INT NOT NULL DEFAULT 1000`);
    await queryRunner.query(`ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS ip_allowlist TEXT[] NOT NULL DEFAULT '{}'`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS api_key_usage_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
        method VARCHAR(12) NOT NULL,
        path VARCHAR(512) NOT NULL,
        status_code INT,
        ip_address VARCHAR(64),
        user_agent TEXT,
        rate_limit_per_minute INT NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_api_key_usage_key_created ON api_key_usage_logs (tenant_id, api_key_id, created_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_api_key_usage_status_created ON api_key_usage_logs (tenant_id, status_code, created_at)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS api_key_usage_logs`);
    await queryRunner.query(`ALTER TABLE api_keys DROP COLUMN IF EXISTS ip_allowlist`);
    await queryRunner.query(`ALTER TABLE api_keys DROP COLUMN IF EXISTS rate_limit_per_minute`);
  }
}
