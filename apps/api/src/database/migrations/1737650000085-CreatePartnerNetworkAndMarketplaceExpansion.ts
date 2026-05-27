import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePartnerNetworkAndMarketplaceExpansion1737650000085 implements MigrationInterface {
  name = 'CreatePartnerNetworkAndMarketplaceExpansion1737650000085';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS partner_tiers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        tier_key VARCHAR(32) NOT NULL,
        display_name VARCHAR(64) NOT NULL,
        commission_rate_bps INT NOT NULL DEFAULT 0,
        reseller_pricing_discount_bps INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, tier_key)
      );

      CREATE TABLE IF NOT EXISTS partner_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        app_partner_id UUID NOT NULL REFERENCES app_partners(id) ON DELETE CASCADE,
        tier_id UUID REFERENCES partner_tiers(id) ON DELETE SET NULL,
        certifications JSONB NOT NULL DEFAULT '{}'::jsonb,
        compliance_status VARCHAR(32) NOT NULL DEFAULT 'pending',
        sandbox_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, app_partner_id)
      );
      CREATE INDEX IF NOT EXISTS idx_partner_profiles_app_partner ON partner_profiles (tenant_id, app_partner_id);

      CREATE TABLE IF NOT EXISTS partner_regions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        app_partner_id UUID NOT NULL REFERENCES app_partners(id) ON DELETE CASCADE,
        region_code VARCHAR(32) NOT NULL,
        region_name VARCHAR(120) NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, app_partner_id, region_code)
      );

      CREATE TABLE IF NOT EXISTS partner_capabilities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        app_partner_id UUID NOT NULL REFERENCES app_partners(id) ON DELETE CASCADE,
        pos_setup JSONB NOT NULL DEFAULT '{}'::jsonb,
        integrations JSONB NOT NULL DEFAULT '{}'::jsonb,
        onboarding JSONB NOT NULL DEFAULT '{}'::jsonb,
        support JSONB NOT NULL DEFAULT '{}'::jsonb,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, app_partner_id)
      );

      CREATE TABLE IF NOT EXISTS partner_users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        app_partner_id UUID NOT NULL REFERENCES app_partners(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        full_name VARCHAR(160) NOT NULL DEFAULT '',
        role_title VARCHAR(120) NOT NULL DEFAULT '',
        portal_password_hash VARCHAR(255) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, email)
      );

      CREATE TABLE IF NOT EXISTS partner_applications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        app_partner_id UUID NOT NULL REFERENCES app_partners(id) ON DELETE CASCADE,
        status VARCHAR(32) NOT NULL DEFAULT 'submitted',
        submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, app_partner_id)
      );

      CREATE TABLE IF NOT EXISTS partner_verification_checks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        application_id UUID NOT NULL REFERENCES partner_applications(id) ON DELETE CASCADE,
        check_key VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        result JSONB NOT NULL DEFAULT '{}'::jsonb,
        performed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, application_id, check_key)
      );

      CREATE TABLE IF NOT EXISTS partner_cert_training_modules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        module_key VARCHAR(64) NOT NULL,
        title VARCHAR(180) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        content JSONB NOT NULL DEFAULT '{}'::jsonb,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, module_key)
      );

      CREATE TABLE IF NOT EXISTS partner_training_progress (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        app_partner_id UUID NOT NULL REFERENCES app_partners(id) ON DELETE CASCADE,
        module_id UUID NOT NULL REFERENCES partner_cert_training_modules(id) ON DELETE CASCADE,
        progress_percent INT NOT NULL DEFAULT 0,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, app_partner_id, module_id)
      );

      CREATE TABLE IF NOT EXISTS partner_approvals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        application_id UUID NOT NULL REFERENCES partner_applications(id) ON DELETE CASCADE,
        status VARCHAR(32) NOT NULL DEFAULT 'approved',
        approved_by_user_id UUID,
        comment TEXT NOT NULL DEFAULT '',
        decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS partner_client_tenants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        app_partner_id UUID NOT NULL REFERENCES app_partners(id) ON DELETE CASCADE,
        client_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        allowed_region_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
        sla JSONB NOT NULL DEFAULT '{}'::jsonb,
        provision_state VARCHAR(32) NOT NULL DEFAULT 'linked',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, app_partner_id, client_tenant_id)
      );
      CREATE INDEX IF NOT EXISTS idx_partner_client_tenants_client ON partner_client_tenants (tenant_id, client_tenant_id);

      CREATE TABLE IF NOT EXISTS partner_marketplace_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        category_key VARCHAR(64) NOT NULL,
        display_name VARCHAR(180) NOT NULL,
        is_global BOOLEAN NOT NULL DEFAULT TRUE,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, category_key)
      );

      CREATE TABLE IF NOT EXISTS partner_marketplace_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        app_partner_id UUID NOT NULL REFERENCES app_partners(id) ON DELETE CASCADE,
        category_id UUID REFERENCES partner_marketplace_categories(id) ON DELETE SET NULL,
        item_type VARCHAR(32) NOT NULL DEFAULT 'integration',
        name VARCHAR(180) NOT NULL,
        slug VARCHAR(220) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        status VARCHAR(32) NOT NULL DEFAULT 'submitted',
        region_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
        linked_app_id UUID NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, slug)
      );

      CREATE INDEX IF NOT EXISTS idx_partner_marketplace_items_partner ON partner_marketplace_items (tenant_id, app_partner_id);
      CREATE INDEX IF NOT EXISTS idx_partner_marketplace_items_region ON partner_marketplace_items (tenant_id, status);

      CREATE TABLE IF NOT EXISTS partner_commission_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        app_partner_id UUID NOT NULL REFERENCES app_partners(id) ON DELETE CASCADE,
        client_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        period_start TIMESTAMPTZ NOT NULL,
        period_end TIMESTAMPTZ NOT NULL,
        amount_cents INT NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        source_type VARCHAR(64) NOT NULL DEFAULT 'app_store_billing',
        source_ref_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb
      );
      CREATE INDEX IF NOT EXISTS idx_partner_commission_records_partner_period ON partner_commission_records (tenant_id, app_partner_id, period_end DESC);

      CREATE TABLE IF NOT EXISTS partner_payout_reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        app_partner_id UUID NOT NULL REFERENCES app_partners(id) ON DELETE CASCADE,
        period_start TIMESTAMPTZ NOT NULL,
        period_end TIMESTAMPTZ NOT NULL,
        total_amount_cents INT NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        status VARCHAR(32) NOT NULL DEFAULT 'draft',
        payout_date TIMESTAMPTZ,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, app_partner_id, period_end)
      );

      CREATE TABLE IF NOT EXISTS partner_referrals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        referrer_app_partner_id UUID REFERENCES app_partners(id) ON DELETE SET NULL,
        referral_code VARCHAR(64) NOT NULL,
        referred_app_partner_id UUID REFERENCES app_partners(id) ON DELETE SET NULL,
        referred_client_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        UNIQUE (tenant_id, referral_code)
      );

      CREATE TABLE IF NOT EXISTS partner_support_tickets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        app_partner_id UUID NOT NULL REFERENCES app_partners(id) ON DELETE CASCADE,
        client_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'open',
        category VARCHAR(64) NOT NULL DEFAULT 'general',
        subject VARCHAR(180) NOT NULL DEFAULT '',
        message TEXT NOT NULL DEFAULT '',
        priority VARCHAR(32) NOT NULL DEFAULT 'medium',
        created_by_partner_user_id UUID,
        resolved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS partner_support_tickets;
      DROP TABLE IF EXISTS partner_referrals;
      DROP TABLE IF EXISTS partner_payout_reports;
      DROP TABLE IF EXISTS partner_commission_records;
      DROP TABLE IF EXISTS partner_marketplace_items;
      DROP TABLE IF EXISTS partner_marketplace_categories;
      DROP TABLE IF EXISTS partner_client_tenants;
      DROP TABLE IF EXISTS partner_approvals;
      DROP TABLE IF EXISTS partner_training_progress;
      DROP TABLE IF EXISTS partner_cert_training_modules;
      DROP TABLE IF EXISTS partner_verification_checks;
      DROP TABLE IF EXISTS partner_applications;
      DROP TABLE IF EXISTS partner_users;
      DROP TABLE IF EXISTS partner_capabilities;
      DROP TABLE IF EXISTS partner_regions;
      DROP TABLE IF EXISTS partner_profiles;
      DROP TABLE IF EXISTS partner_tiers;
    `);
  }
}

