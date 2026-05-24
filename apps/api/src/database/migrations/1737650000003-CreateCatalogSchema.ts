import { MigrationInterface, QueryRunner } from 'typeorm';

/** ERD §1.2 Catalog tables — SRS §3 Products & Catalog */
export class CreateCatalogSchema1737650000003 implements MigrationInterface {
  name = 'CreateCatalogSchema1737650000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_categories_tenant_id ON categories (tenant_id);

      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        price DECIMAL(12, 2) NOT NULL DEFAULT 0,
        status VARCHAR(32) NOT NULL DEFAULT 'draft',
        sort_order INT NOT NULL DEFAULT 0,
        channel_visibility JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products (tenant_id);
      CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id);

      CREATE TABLE IF NOT EXISTS variants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        price_delta DECIMAL(12, 2) NOT NULL DEFAULT 0,
        sku VARCHAR(128),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ,
        UNIQUE (product_id, sku)
      );

      CREATE TABLE IF NOT EXISTS modifiers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(32) NOT NULL,
        required BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_modifiers_tenant_id ON modifiers (tenant_id);

      CREATE TABLE IF NOT EXISTS modifier_options (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        modifier_id UUID NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        price_delta DECIMAL(12, 2) NOT NULL DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_modifier_options_modifier_id ON modifier_options (modifier_id);

      CREATE TABLE IF NOT EXISTS addons (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(12, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_addons_tenant_id ON addons (tenant_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS addons;
      DROP TABLE IF EXISTS modifier_options;
      DROP TABLE IF EXISTS modifiers;
      DROP TABLE IF EXISTS variants;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS categories;
    `);
  }
}
