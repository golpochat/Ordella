import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUnifiedCatalog1737650000047 implements MigrationInterface {
  name = 'CreateUnifiedCatalog1737650000047';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS brand_groups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        hq_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        brand_tenant_ids UUID[] NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_brand_groups_hq_tenant ON brand_groups(hq_tenant_id);

      ALTER TABLE tenants
        ADD COLUMN IF NOT EXISTS brand_group_id UUID NULL REFERENCES brand_groups(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS brand_name VARCHAR(255) NULL,
        ADD COLUMN IF NOT EXISTS brand_logo VARCHAR(2048) NULL,
        ADD COLUMN IF NOT EXISTS brand_theme_id UUID NULL;
      CREATE INDEX IF NOT EXISTS idx_tenants_brand_group ON tenants(brand_group_id);

      CREATE TABLE IF NOT EXISTS global_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        brand_group_id UUID NOT NULL REFERENCES brand_groups(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_global_categories_brand_name ON global_categories(brand_group_id, name);

      CREATE TABLE IF NOT EXISTS global_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        brand_group_id UUID NOT NULL REFERENCES brand_groups(id) ON DELETE CASCADE,
        global_category_id UUID NULL REFERENCES global_categories(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        base_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
        sku VARCHAR(128) NULL,
        barcode VARCHAR(128) NULL,
        tax_category_id UUID NULL REFERENCES tax_categories(id) ON DELETE SET NULL,
        image_url VARCHAR(2048) NULL,
        attributes JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NULL
      );
      CREATE INDEX IF NOT EXISTS idx_global_items_brand_name ON global_items(brand_group_id, name);
      CREATE INDEX IF NOT EXISTS idx_global_items_brand_sku ON global_items(brand_group_id, sku);

      ALTER TABLE products
        ADD COLUMN IF NOT EXISTS global_item_id UUID NULL REFERENCES global_items(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS override_price DECIMAL(12, 2) NULL,
        ADD COLUMN IF NOT EXISTS override_name VARCHAR(255) NULL,
        ADD COLUMN IF NOT EXISTS override_description TEXT NULL,
        ADD COLUMN IF NOT EXISTS override_attributes JSONB NOT NULL DEFAULT '{}';
      CREATE INDEX IF NOT EXISTS idx_products_tenant_global_item ON products(tenant_id, global_item_id);

      ALTER TABLE categories
        ADD COLUMN IF NOT EXISTS global_category_id UUID NULL REFERENCES global_categories(id) ON DELETE SET NULL;
      CREATE INDEX IF NOT EXISTS idx_categories_tenant_global_category ON categories(tenant_id, global_category_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_products_tenant_global_item;
      DROP INDEX IF EXISTS idx_categories_tenant_global_category;
      ALTER TABLE categories DROP COLUMN IF EXISTS global_category_id;
      ALTER TABLE products
        DROP COLUMN IF EXISTS override_attributes,
        DROP COLUMN IF EXISTS override_description,
        DROP COLUMN IF EXISTS override_name,
        DROP COLUMN IF EXISTS override_price,
        DROP COLUMN IF EXISTS global_item_id;
      DROP INDEX IF EXISTS idx_global_items_brand_sku;
      DROP INDEX IF EXISTS idx_global_items_brand_name;
      DROP TABLE IF EXISTS global_items;
      DROP INDEX IF EXISTS idx_global_categories_brand_name;
      DROP TABLE IF EXISTS global_categories;
      DROP INDEX IF EXISTS idx_tenants_brand_group;
      ALTER TABLE tenants
        DROP COLUMN IF EXISTS brand_theme_id,
        DROP COLUMN IF EXISTS brand_logo,
        DROP COLUMN IF EXISTS brand_name,
        DROP COLUMN IF EXISTS brand_group_id;
      DROP INDEX IF EXISTS idx_brand_groups_hq_tenant;
      DROP TABLE IF EXISTS brand_groups;
    `);
  }
}
