import { MigrationInterface, QueryRunner } from 'typeorm';

/** Retail catalog builder — category/product fields + per-product modifiers */
export class ExtendCatalogRetailFields1737650000023 implements MigrationInterface {
  name = 'ExtendCatalogRetailFields1737650000023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE categories
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

      ALTER TABLE products
        ADD COLUMN IF NOT EXISTS sku VARCHAR(128),
        ADD COLUMN IF NOT EXISTS barcode VARCHAR(128),
        ADD COLUMN IF NOT EXISTS image_url VARCHAR(2048),
        ADD COLUMN IF NOT EXISTS inventory_tracking_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS stock_level INT;

      CREATE TABLE IF NOT EXISTS product_modifiers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        modifier_id UUID NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (product_id, modifier_id)
      );

      CREATE INDEX IF NOT EXISTS idx_product_modifiers_tenant ON product_modifiers (tenant_id);
      CREATE INDEX IF NOT EXISTS idx_product_modifiers_product ON product_modifiers (product_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS product_modifiers;
      ALTER TABLE products
        DROP COLUMN IF EXISTS stock_level,
        DROP COLUMN IF EXISTS inventory_tracking_enabled,
        DROP COLUMN IF EXISTS image_url,
        DROP COLUMN IF EXISTS barcode,
        DROP COLUMN IF EXISTS sku;
      ALTER TABLE categories
        DROP COLUMN IF EXISTS is_active,
        DROP COLUMN IF EXISTS description;
    `);
  }
}
