import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnterpriseSsoMvp1737650000054 implements MigrationInterface {
  name = 'CreateEnterpriseSsoMvp1737650000054';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sso_providers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        provider_type VARCHAR(32) NOT NULL,
        client_id VARCHAR(255) NULL,
        client_secret_encrypted TEXT NULL,
        issuer_url TEXT NULL,
        redirect_url TEXT NULL,
        metadata_url TEXT NULL,
        authorization_url TEXT NULL,
        token_url TEXT NULL,
        jwks_uri TEXT NULL,
        default_role VARCHAR(128) NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_sso_providers_tenant_type ON sso_providers(tenant_id, provider_type);

      CREATE TABLE IF NOT EXISTS sso_role_mappings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        provider_id UUID NULL REFERENCES sso_providers(id) ON DELETE CASCADE,
        external_role VARCHAR(255) NOT NULL,
        internal_role VARCHAR(128) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_sso_role_mappings_tenant_external ON sso_role_mappings(tenant_id, external_role);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_sso_role_mappings_tenant_provider_external
        ON sso_role_mappings(tenant_id, provider_id, external_role);

      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS external_id VARCHAR(255) NULL,
        ADD COLUMN IF NOT EXISTS federated_roles JSONB NOT NULL DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ NULL;
      CREATE INDEX IF NOT EXISTS idx_users_tenant_external_id ON users(tenant_id, external_id) WHERE external_id IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_users_tenant_last_login ON users(tenant_id, last_login_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_users_tenant_last_login;
      DROP INDEX IF EXISTS idx_users_tenant_external_id;
      ALTER TABLE users
        DROP COLUMN IF EXISTS last_login_at,
        DROP COLUMN IF EXISTS federated_roles,
        DROP COLUMN IF EXISTS external_id;
      DROP INDEX IF EXISTS idx_sso_role_mappings_tenant_provider_external;
      DROP INDEX IF EXISTS idx_sso_role_mappings_tenant_external;
      DROP TABLE IF EXISTS sso_role_mappings;
      DROP INDEX IF EXISTS idx_sso_providers_tenant_type;
      DROP TABLE IF EXISTS sso_providers;
    `);
  }
}
