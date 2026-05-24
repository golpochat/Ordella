import { MigrationInterface, QueryRunner } from 'typeorm';

/** Reporting ingest + summary tables for domain processors */
export class CreateReportingCoreTables1737650000018 implements MigrationInterface {
  name = 'CreateReportingCoreTables1737650000018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS report_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        event_type VARCHAR(64) NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_report_events_tenant_type_created
        ON report_events (tenant_id, event_type, created_at);

      CREATE TABLE IF NOT EXISTS daily_sales_summaries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        summary_date DATE NOT NULL,
        total_orders INT NOT NULL DEFAULT 0,
        total_revenue DECIMAL(14, 2) NOT NULL DEFAULT 0,
        total_discounts DECIMAL(14, 2) NOT NULL DEFAULT 0,
        total_refunds DECIMAL(14, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ,
        UNIQUE (tenant_id, summary_date)
      );

      CREATE TABLE IF NOT EXISTS inventory_movement_summaries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        summary_date DATE NOT NULL,
        product_id UUID NOT NULL,
        quantity_in DECIMAL(14, 4) NOT NULL DEFAULT 0,
        quantity_out DECIMAL(14, 4) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ,
        UNIQUE (tenant_id, summary_date, product_id)
      );

      CREATE TABLE IF NOT EXISTS delivery_performance_summaries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        summary_date DATE NOT NULL,
        completed INT NOT NULL DEFAULT 0,
        failed INT NOT NULL DEFAULT 0,
        avg_delivery_time_seconds DECIMAL(14, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ,
        UNIQUE (tenant_id, summary_date)
      );

      CREATE TABLE IF NOT EXISTS promotion_usage_summaries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        summary_date DATE NOT NULL,
        promotion_id UUID NOT NULL,
        application_count INT NOT NULL DEFAULT 0,
        total_discount DECIMAL(14, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ,
        UNIQUE (tenant_id, summary_date, promotion_id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS promotion_usage_summaries;
      DROP TABLE IF EXISTS delivery_performance_summaries;
      DROP TABLE IF EXISTS inventory_movement_summaries;
      DROP TABLE IF EXISTS daily_sales_summaries;
      DROP TABLE IF EXISTS report_events;
    `);
  }
}
