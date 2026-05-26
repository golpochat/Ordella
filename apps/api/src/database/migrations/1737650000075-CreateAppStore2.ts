import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppStore21737650000075 implements MigrationInterface {
  name = 'CreateAppStore21737650000075';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS app_partners (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        company_name VARCHAR(160) NOT NULL,
        contact_name VARCHAR(160) NOT NULL,
        email VARCHAR(255) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        sandbox_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, email)
      );

      CREATE TABLE IF NOT EXISTS marketplace_apps (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        partner_id UUID REFERENCES app_partners(id) ON DELETE SET NULL,
        name VARCHAR(160) NOT NULL,
        slug VARCHAR(160) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        provider VARCHAR(160) NOT NULL,
        category VARCHAR(48) NOT NULL,
        pricing_model VARCHAR(48) NOT NULL DEFAULT 'free',
        price_cents INT NOT NULL DEFAULT 0,
        usage_unit VARCHAR(48),
        revenue_share_bps INT NOT NULL DEFAULT 0,
        status VARCHAR(32) NOT NULL DEFAULT 'approved',
        requested_scopes JSONB NOT NULL DEFAULT '[]',
        webhook_events JSONB NOT NULL DEFAULT '[]',
        rate_limit_per_minute INT NOT NULL DEFAULT 1000,
        icon_url VARCHAR(512),
        screenshots JSONB NOT NULL DEFAULT '[]',
        docs_url VARCHAR(512),
        oauth_redirect_urls JSONB NOT NULL DEFAULT '[]',
        client_id VARCHAR(128),
        client_secret_hash VARCHAR(128),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS app_versions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        app_id UUID NOT NULL REFERENCES marketplace_apps(id) ON DELETE CASCADE,
        version VARCHAR(48) NOT NULL,
        changelog TEXT,
        manifest JSONB NOT NULL DEFAULT '{}',
        status VARCHAR(32) NOT NULL DEFAULT 'approved',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (app_id, version)
      );

      CREATE TABLE IF NOT EXISTS app_reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        app_id UUID NOT NULL REFERENCES marketplace_apps(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        rating INT NOT NULL,
        comment TEXT,
        status VARCHAR(32) NOT NULL DEFAULT 'published',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS app_installations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        app_id UUID NOT NULL REFERENCES marketplace_apps(id) ON DELETE CASCADE,
        installed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'installed',
        granted_scopes JSONB NOT NULL DEFAULT '[]',
        webhook_events JSONB NOT NULL DEFAULT '[]',
        api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
        webhook_id UUID REFERENCES webhooks(id) ON DELETE SET NULL,
        oauth_client_id VARCHAR(128),
        rate_limit_per_minute INT NOT NULL DEFAULT 1000,
        billing_status VARCHAR(32) NOT NULL DEFAULT 'free',
        billing_cycle_anchor TIMESTAMPTZ,
        usage_counters JSONB NOT NULL DEFAULT '{}',
        consent_snapshot JSONB NOT NULL DEFAULT '{}',
        installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        uninstalled_at TIMESTAMPTZ,
        UNIQUE (tenant_id, app_id)
      );

      CREATE TABLE IF NOT EXISTS app_billing_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        app_id UUID NOT NULL REFERENCES marketplace_apps(id) ON DELETE CASCADE,
        installation_id UUID NOT NULL REFERENCES app_installations(id) ON DELETE CASCADE,
        partner_id UUID REFERENCES app_partners(id) ON DELETE SET NULL,
        record_type VARCHAR(48) NOT NULL,
        amount_cents INT NOT NULL DEFAULT 0,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        quantity INT NOT NULL DEFAULT 0,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_marketplace_apps_category_status ON marketplace_apps (category, status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_app_reviews_tenant_app ON app_reviews (tenant_id, app_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_app_reviews_app_rating ON app_reviews (app_id, rating)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_app_installations_tenant_status ON app_installations (tenant_id, status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_app_billing_tenant_app_created ON app_billing_records (tenant_id, app_id, created_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_app_billing_partner_created ON app_billing_records (partner_id, created_at)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_app_billing_partner_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_app_billing_tenant_app_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_app_installations_tenant_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_app_reviews_app_rating`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_app_reviews_tenant_app`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_marketplace_apps_category_status`);
    await queryRunner.query(`DROP TABLE IF EXISTS app_billing_records`);
    await queryRunner.query(`DROP TABLE IF EXISTS app_installations`);
    await queryRunner.query(`DROP TABLE IF EXISTS app_reviews`);
    await queryRunner.query(`DROP TABLE IF EXISTS app_versions`);
    await queryRunner.query(`DROP TABLE IF EXISTS marketplace_apps`);
    await queryRunner.query(`DROP TABLE IF EXISTS app_partners`);
  }
}
