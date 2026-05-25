import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaxComplianceMvp1737650000046 implements MigrationInterface {
  name = 'CreateTaxComplianceMvp1737650000046';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tax_rules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NULL REFERENCES locations(id) ON DELETE CASCADE,
        country VARCHAR(2) NOT NULL,
        region VARCHAR(64) NULL,
        tax_name VARCHAR(128) NOT NULL,
        tax_rate DECIMAL(8,4) NOT NULL,
        tax_type VARCHAR(32) NOT NULL,
        applies_to TEXT[] NOT NULL DEFAULT '{items}',
        price_mode VARCHAR(32) NOT NULL DEFAULT 'exclusive',
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        rounding_mode VARCHAR(32) NOT NULL DEFAULT 'half_up',
        decimal_places INT NOT NULL DEFAULT 2,
        tax_id_label VARCHAR(64) NULL,
        tax_id_value VARCHAR(128) NULL,
        invoice_fields JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_tax_rules_tenant_country_region ON tax_rules(tenant_id, country, region);
      CREATE INDEX IF NOT EXISTS idx_tax_rules_tenant_location ON tax_rules(tenant_id, location_id);

      CREATE TABLE IF NOT EXISTS tax_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(128) NOT NULL,
        description TEXT NULL,
        default_tax_rule_id UUID NULL REFERENCES tax_rules(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_tax_categories_tenant_name ON tax_categories(tenant_id, name);

      ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_category_id UUID NULL REFERENCES tax_categories(id) ON DELETE SET NULL;
      ALTER TABLE order_items ADD COLUMN IF NOT EXISTS tax_category_id UUID NULL REFERENCES tax_categories(id) ON DELETE SET NULL;

      CREATE TABLE IF NOT EXISTS order_tax_lines (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        order_item_id UUID NULL REFERENCES order_items(id) ON DELETE CASCADE,
        tax_rule_id UUID NULL REFERENCES tax_rules(id) ON DELETE SET NULL,
        tax_category_id UUID NULL REFERENCES tax_categories(id) ON DELETE SET NULL,
        tax_name VARCHAR(128) NOT NULL,
        tax_type VARCHAR(32) NOT NULL,
        price_mode VARCHAR(32) NOT NULL,
        tax_rate DECIMAL(8,4) NOT NULL,
        taxable_amount DECIMAL(12,2) NOT NULL,
        tax_amount DECIMAL(12,2) NOT NULL,
        jurisdiction VARCHAR(128) NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_order_tax_lines_tenant_order ON order_tax_lines(tenant_id, order_id);
      CREATE INDEX IF NOT EXISTS idx_order_tax_lines_tenant_location_created ON order_tax_lines(tenant_id, location_id, created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_order_tax_lines_tenant_location_created;
      DROP INDEX IF EXISTS idx_order_tax_lines_tenant_order;
      DROP TABLE IF EXISTS order_tax_lines;
      ALTER TABLE order_items DROP COLUMN IF EXISTS tax_category_id;
      ALTER TABLE products DROP COLUMN IF EXISTS tax_category_id;
      DROP INDEX IF EXISTS idx_tax_categories_tenant_name;
      DROP TABLE IF EXISTS tax_categories;
      DROP INDEX IF EXISTS idx_tax_rules_tenant_location;
      DROP INDEX IF EXISTS idx_tax_rules_tenant_country_region;
      DROP TABLE IF EXISTS tax_rules;
    `);
  }
}
