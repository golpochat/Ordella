import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceProcurementWorkflow1737650000057 implements MigrationInterface {
  name = 'EnhanceProcurementWorkflow1737650000057';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE purchase_orders
        ADD COLUMN IF NOT EXISTS delivery_documents JSONB NOT NULL DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ NULL,
        ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ NULL,
        ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ NULL;
      CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_status ON purchase_orders(tenant_id, supplier_id, supplier_status);
      CREATE INDEX IF NOT EXISTS idx_purchase_orders_expected_delivery ON purchase_orders(tenant_id, expected_delivery_date);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_purchase_orders_expected_delivery;
      DROP INDEX IF EXISTS idx_purchase_orders_supplier_status;
      ALTER TABLE purchase_orders
        DROP COLUMN IF EXISTS shipped_at,
        DROP COLUMN IF EXISTS rejected_at,
        DROP COLUMN IF EXISTS confirmed_at,
        DROP COLUMN IF EXISTS delivery_documents;
    `);
  }
}
