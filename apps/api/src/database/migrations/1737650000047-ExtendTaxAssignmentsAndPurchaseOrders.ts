import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendTaxAssignmentsAndPurchaseOrders1737650000047 implements MigrationInterface {
  name = 'ExtendTaxAssignmentsAndPurchaseOrders1737650000047';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE categories
        ADD COLUMN IF NOT EXISTS tax_category_id UUID NULL REFERENCES tax_categories(id) ON DELETE SET NULL;

      ALTER TABLE purchase_orders
        ADD COLUMN IF NOT EXISTS subtotal_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS tax_total DECIMAL(12,2) NOT NULL DEFAULT 0;

      UPDATE purchase_orders
      SET subtotal_cost = total_cost
      WHERE subtotal_cost = 0 AND total_cost <> 0;

      ALTER TABLE purchase_order_items
        ADD COLUMN IF NOT EXISTS tax_category_id UUID NULL REFERENCES tax_categories(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS tax_rule_id UUID NULL REFERENCES tax_rules(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS price_mode VARCHAR(32) NOT NULL DEFAULT 'inclusive',
        ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(8,4) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS taxable_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE purchase_order_items
        DROP COLUMN IF EXISTS tax_amount,
        DROP COLUMN IF EXISTS taxable_amount,
        DROP COLUMN IF EXISTS tax_rate,
        DROP COLUMN IF EXISTS price_mode,
        DROP COLUMN IF EXISTS tax_rule_id,
        DROP COLUMN IF EXISTS tax_category_id;

      ALTER TABLE purchase_orders
        DROP COLUMN IF EXISTS tax_total,
        DROP COLUMN IF EXISTS subtotal_cost;

      ALTER TABLE categories DROP COLUMN IF EXISTS tax_category_id;
    `);
  }
}

