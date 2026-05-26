import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceIntegrationsHub1737650000074 implements MigrationInterface {
  name = 'EnhanceIntegrationsHub1737650000074';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE integration_providers ADD COLUMN IF NOT EXISTS auth_type VARCHAR(32) NOT NULL DEFAULT 'api_key'`);
    await queryRunner.query(`ALTER TABLE integration_providers ADD COLUMN IF NOT EXISTS capabilities JSONB NOT NULL DEFAULT '[]'`);
    await queryRunner.query(`ALTER TABLE integration_providers ADD COLUMN IF NOT EXISTS docs_url VARCHAR(255)`);
    await queryRunner.query(`ALTER TABLE integrations ADD COLUMN IF NOT EXISTS integration_type VARCHAR(32) NOT NULL DEFAULT 'other'`);
    await queryRunner.query(`ALTER TABLE integrations ADD COLUMN IF NOT EXISTS provider_slug VARCHAR(64)`);
    await queryRunner.query(`ALTER TABLE integrations ADD COLUMN IF NOT EXISTS credential_ciphertext TEXT`);
    await queryRunner.query(`ALTER TABLE integrations ADD COLUMN IF NOT EXISTS sync_schedule VARCHAR(64)`);
    await queryRunner.query(`ALTER TABLE integrations ADD COLUMN IF NOT EXISTS conflict_resolution VARCHAR(32) NOT NULL DEFAULT 'provider_wins'`);
    await queryRunner.query(`ALTER TABLE integrations ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE integrations ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ`);
    await queryRunner.query(`ALTER TABLE integrations ADD COLUMN IF NOT EXISTS last_sync_status VARCHAR(32)`);
    await queryRunner.query(`ALTER TABLE integration_logs ADD COLUMN IF NOT EXISTS request_payload JSONB`);
    await queryRunner.query(`ALTER TABLE integration_logs ADD COLUMN IF NOT EXISTS response_payload JSONB`);
    await queryRunner.query(`ALTER TABLE integration_logs ADD COLUMN IF NOT EXISTS error_code VARCHAR(64)`);
    await queryRunner.query(`ALTER TABLE integration_logs ADD COLUMN IF NOT EXISTS duration_ms INT`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_integrations_tenant_type_status ON integrations (tenant_id, integration_type, status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_integrations_last_sync ON integrations (tenant_id, last_sync_at)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_integrations_last_sync`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_integrations_tenant_type_status`);
    await queryRunner.query(`ALTER TABLE integration_logs DROP COLUMN IF EXISTS duration_ms`);
    await queryRunner.query(`ALTER TABLE integration_logs DROP COLUMN IF EXISTS error_code`);
    await queryRunner.query(`ALTER TABLE integration_logs DROP COLUMN IF EXISTS response_payload`);
    await queryRunner.query(`ALTER TABLE integration_logs DROP COLUMN IF EXISTS request_payload`);
    await queryRunner.query(`ALTER TABLE integrations DROP COLUMN IF EXISTS last_sync_status`);
    await queryRunner.query(`ALTER TABLE integrations DROP COLUMN IF EXISTS last_sync_at`);
    await queryRunner.query(`ALTER TABLE integrations DROP COLUMN IF EXISTS retry_count`);
    await queryRunner.query(`ALTER TABLE integrations DROP COLUMN IF EXISTS conflict_resolution`);
    await queryRunner.query(`ALTER TABLE integrations DROP COLUMN IF EXISTS sync_schedule`);
    await queryRunner.query(`ALTER TABLE integrations DROP COLUMN IF EXISTS credential_ciphertext`);
    await queryRunner.query(`ALTER TABLE integrations DROP COLUMN IF EXISTS provider_slug`);
    await queryRunner.query(`ALTER TABLE integrations DROP COLUMN IF EXISTS integration_type`);
    await queryRunner.query(`ALTER TABLE integration_providers DROP COLUMN IF EXISTS docs_url`);
    await queryRunner.query(`ALTER TABLE integration_providers DROP COLUMN IF EXISTS capabilities`);
    await queryRunner.query(`ALTER TABLE integration_providers DROP COLUMN IF EXISTS auth_type`);
  }
}
