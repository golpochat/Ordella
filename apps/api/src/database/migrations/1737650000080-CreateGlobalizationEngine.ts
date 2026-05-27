import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGlobalizationEngine1737650000080 implements MigrationInterface {
  name = 'CreateGlobalizationEngine1737650000080';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS globalization_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        base_currency VARCHAR(8) NOT NULL DEFAULT 'EUR',
        default_locale VARCHAR(16) NOT NULL DEFAULT 'en-IE',
        supported_countries TEXT[] NOT NULL DEFAULT '{IE,GB,US}',
        supported_currencies TEXT[] NOT NULL DEFAULT '{EUR,GBP,USD}',
        dual_pricing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        rounding_mode VARCHAR(32) NOT NULL DEFAULT 'half_up',
        cash_rounding_increment DECIMAL(6,4) NOT NULL DEFAULT 0.05,
        fx_provider VARCHAR(64) NOT NULL DEFAULT 'ordella-fx-fallback',
        reporting_currency VARCHAR(8) NOT NULL DEFAULT 'EUR',
        metadata JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id)
      );

      CREATE TABLE IF NOT EXISTS fx_rates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        from_currency VARCHAR(8) NOT NULL,
        to_currency VARCHAR(8) NOT NULL,
        rate DECIMAL(18,8) NOT NULL,
        source VARCHAR(32) NOT NULL DEFAULT 'fallback',
        effective_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_fx_rates_tenant_pair ON fx_rates (tenant_id, from_currency, to_currency, effective_at DESC);

      CREATE TABLE IF NOT EXISTS country_price_lists (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        country_code VARCHAR(2) NOT NULL,
        currency VARCHAR(8) NOT NULL,
        product_id UUID NOT NULL,
        price DECIMAL(12,2) NOT NULL,
        compare_at_price DECIMAL(12,2),
        tax_inclusive BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, country_code, product_id)
      );

      CREATE TABLE IF NOT EXISTS country_catalog_rules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        country_code VARCHAR(2) NOT NULL,
        region_code VARCHAR(64),
        entity_type VARCHAR(32) NOT NULL,
        entity_id UUID NOT NULL,
        is_available BOOLEAN NOT NULL DEFAULT TRUE,
        overrides JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_country_catalog_rules_lookup ON country_catalog_rules (tenant_id, country_code, entity_type, entity_id);

      CREATE TABLE IF NOT EXISTS country_delivery_rules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        country_code VARCHAR(2) NOT NULL,
        currency VARCHAR(8) NOT NULL DEFAULT 'EUR',
        delivery_zones JSONB NOT NULL DEFAULT '[]',
        cross_border_allowed BOOLEAN NOT NULL DEFAULT FALSE,
        restrictions JSONB NOT NULL DEFAULT '{}',
        minimum_order_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, country_code)
      );

      CREATE TABLE IF NOT EXISTS country_promotion_rules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        country_code VARCHAR(2) NOT NULL,
        promotion_id UUID,
        currency VARCHAR(8) NOT NULL DEFAULT 'EUR',
        discount_type VARCHAR(32) NOT NULL DEFAULT 'percent',
        discount_value DECIMAL(12,2) NOT NULL DEFAULT 0,
        tax_aware BOOLEAN NOT NULL DEFAULT TRUE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, country_code, promotion_id)
      );

      CREATE TABLE IF NOT EXISTS tax_exemptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        country_code VARCHAR(2) NOT NULL,
        region_code VARCHAR(64),
        exemption_type VARCHAR(32) NOT NULL,
        tax_id VARCHAR(64),
        customer_id UUID,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_tax_exemptions_lookup ON tax_exemptions (tenant_id, country_code, exemption_type);

      CREATE TABLE IF NOT EXISTS localized_content (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        entity_type VARCHAR(32) NOT NULL,
        entity_id VARCHAR(160) NOT NULL,
        locale VARCHAR(16) NOT NULL,
        field VARCHAR(64) NOT NULL,
        value TEXT NOT NULL,
        text_direction VARCHAR(8) NOT NULL DEFAULT 'ltr',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, entity_type, entity_id, locale, field)
      );

      CREATE TABLE IF NOT EXISTS compliance_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        country_code VARCHAR(2) NOT NULL,
        invoice_format VARCHAR(64) NOT NULL DEFAULT 'standard_vat',
        privacy_regime VARCHAR(64) NOT NULL DEFAULT 'gdpr',
        tax_report_template VARCHAR(64) NOT NULL DEFAULT 'vat_return',
        invoice_fields JSONB NOT NULL DEFAULT '{}',
        export_config JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, country_code)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS compliance_profiles;
      DROP TABLE IF EXISTS localized_content;
      DROP TABLE IF EXISTS tax_exemptions;
      DROP TABLE IF EXISTS country_promotion_rules;
      DROP TABLE IF EXISTS country_delivery_rules;
      DROP TABLE IF EXISTS country_catalog_rules;
      DROP TABLE IF EXISTS country_price_lists;
      DROP TABLE IF EXISTS fx_rates;
      DROP TABLE IF EXISTS globalization_settings;
    `);
  }
}
