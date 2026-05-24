import { MigrationInterface, QueryRunner } from 'typeorm';

/** Adds quantity_reserved on stock_items and metadata columns for adjustments/movements. */
export class AddInventoryStockColumns1737650000014 implements MigrationInterface {
  name = 'AddInventoryStockColumns1737650000014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE stock_items
        ADD COLUMN IF NOT EXISTS quantity_reserved DECIMAL(14, 4) NOT NULL DEFAULT 0;

      CREATE INDEX IF NOT EXISTS idx_stock_items_tenant_location_product
        ON stock_items (tenant_id, location_id, product_id)
        WHERE product_id IS NOT NULL;

      ALTER TABLE stock_adjustments
        ADD COLUMN IF NOT EXISTS type VARCHAR(32) NOT NULL DEFAULT 'manual';

      ALTER TABLE stock_movements
        ADD COLUMN IF NOT EXISTS source VARCHAR(32);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_stock_items_tenant_location_product;

      ALTER TABLE stock_movements DROP COLUMN IF EXISTS source;
      ALTER TABLE stock_adjustments DROP COLUMN IF EXISTS type;
      ALTER TABLE stock_items DROP COLUMN IF EXISTS quantity_reserved;
    `);
  }
}
