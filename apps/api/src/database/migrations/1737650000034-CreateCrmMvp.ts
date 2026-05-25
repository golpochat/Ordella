import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCrmMvp1737650000034 implements MigrationInterface {
  name = 'CreateCrmMvp1737650000034';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS total_orders INT NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS avg_order_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS first_order_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS preferred_location_id UUID,
      ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS segments TEXT[] NOT NULL DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS staff_notes TEXT
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customer_insights (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        tenant_id UUID NOT NULL,
        metrics JSONB NOT NULL DEFAULT '{}',
        categories_purchased TEXT[] NOT NULL DEFAULT '{}',
        order_frequency VARCHAR(64) NOT NULL DEFAULT 'no_orders',
        churn_risk_score DECIMAL(5, 2),
        updated_at TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT uq_customer_insights_tenant_customer UNIQUE (tenant_id, customer_id)
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customers_tenant_segments ON customers USING GIN (segments)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customers_tenant_tags ON customers USING GIN (tags)`);
    await queryRunner.query(`
      INSERT INTO permissions (key, description)
      VALUES
        ('crm.read', 'Read CRM customers and insights'),
        ('crm.write', 'Update CRM customer tags, notes, and insights')
      ON CONFLICT (key) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customers_tenant_tags`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customers_tenant_segments`);
    await queryRunner.query(`DROP TABLE IF EXISTS customer_insights`);
    await queryRunner.query(`
      ALTER TABLE customers
      DROP COLUMN IF EXISTS staff_notes,
      DROP COLUMN IF EXISTS segments,
      DROP COLUMN IF EXISTS tags,
      DROP COLUMN IF EXISTS preferred_location_id,
      DROP COLUMN IF EXISTS first_order_at,
      DROP COLUMN IF EXISTS avg_order_value,
      DROP COLUMN IF EXISTS total_orders
    `);
  }
}
