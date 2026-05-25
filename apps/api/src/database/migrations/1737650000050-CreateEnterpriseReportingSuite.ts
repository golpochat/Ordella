import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnterpriseReportingSuite1737650000050 implements MigrationInterface {
  name = 'CreateEnterpriseReportingSuite1737650000050';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS report_snapshots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        report_type VARCHAR(64) NOT NULL,
        cache_key VARCHAR(512) NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}',
        generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NULL
      );
      CREATE INDEX IF NOT EXISTS idx_report_snapshots_tenant_type_key ON report_snapshots(tenant_id, report_type, cache_key);
      CREATE INDEX IF NOT EXISTS idx_report_snapshots_tenant_generated ON report_snapshots(tenant_id, generated_at);

      ALTER TABLE report_jobs
        ALTER COLUMN definition_id DROP NOT NULL,
        ADD COLUMN IF NOT EXISTS report_type VARCHAR(64) NULL,
        ADD COLUMN IF NOT EXISTS parameters JSONB NOT NULL DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS location_id UUID NULL,
        ADD COLUMN IF NOT EXISTS requested_by UUID NULL,
        ADD COLUMN IF NOT EXISTS file_url VARCHAR(1024) NULL;
      CREATE INDEX IF NOT EXISTS idx_report_jobs_tenant_report_type ON report_jobs(tenant_id, report_type, created_at);

      CREATE INDEX IF NOT EXISTS idx_orders_reporting_date_location ON orders(tenant_id, created_at, location_id, order_type);
      CREATE INDEX IF NOT EXISTS idx_order_items_reporting_product ON order_items(product_id, order_id);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_reporting_date ON stock_movements(tenant_id, created_at, stock_item_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_stock_movements_reporting_date;
      DROP INDEX IF EXISTS idx_order_items_reporting_product;
      DROP INDEX IF EXISTS idx_orders_reporting_date_location;
      DROP INDEX IF EXISTS idx_report_jobs_tenant_report_type;
      ALTER TABLE report_jobs
        DROP COLUMN IF EXISTS file_url,
        DROP COLUMN IF EXISTS requested_by,
        DROP COLUMN IF EXISTS location_id,
        DROP COLUMN IF EXISTS parameters,
        DROP COLUMN IF EXISTS report_type;
      DROP INDEX IF EXISTS idx_report_snapshots_tenant_generated;
      DROP INDEX IF EXISTS idx_report_snapshots_tenant_type_key;
      DROP TABLE IF EXISTS report_snapshots;
    `);
  }
}
