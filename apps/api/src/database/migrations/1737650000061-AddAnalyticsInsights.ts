import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalyticsInsights1737650000061 implements MigrationInterface {
  name = 'AddAnalyticsInsights1737650000061';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS analytics_insight_settings (
        tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
        segmentation_rules JSONB NOT NULL DEFAULT '{"highValuePercentile":0.8,"frequentBuyerOrders":4,"newCustomerDays":30}',
        ltv_parameters JSONB NOT NULL DEFAULT '{"predictionMonths":6,"grossMarginPercent":35,"discountRatePercent":8}',
        churn_thresholds JSONB NOT NULL DEFAULT '{"medium":45,"high":65,"critical":85,"inactiveDays":60}',
        updated_at TIMESTAMPTZ NULL
      );

      CREATE TABLE IF NOT EXISTS customer_segments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        rules JSONB NOT NULL DEFAULT '{}',
        customer_ids UUID[] NOT NULL DEFAULT '{}',
        metrics JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NULL,
        CONSTRAINT uq_customer_segments_tenant_name UNIQUE (tenant_id, name)
      );

      CREATE TABLE IF NOT EXISTS customer_ltv_snapshots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        snapshot_date DATE NOT NULL,
        lifetime_value NUMERIC(12,2) NOT NULL DEFAULT 0,
        predicted_ltv NUMERIC(12,2) NOT NULL DEFAULT 0,
        avg_order_value NUMERIC(12,2) NOT NULL DEFAULT 0,
        order_count INT NOT NULL DEFAULT 0,
        parameters JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_customer_ltv_snapshots_tenant_customer_date ON customer_ltv_snapshots(tenant_id, customer_id, snapshot_date);

      CREATE TABLE IF NOT EXISTS churn_risk_snapshots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        snapshot_date DATE NOT NULL,
        risk_score NUMERIC(5,2) NOT NULL DEFAULT 0,
        risk_band VARCHAR(32) NOT NULL,
        factors JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_churn_risk_snapshots_tenant_customer_date ON churn_risk_snapshots(tenant_id, customer_id, snapshot_date);
      CREATE INDEX IF NOT EXISTS idx_churn_risk_snapshots_tenant_band ON churn_risk_snapshots(tenant_id, risk_band);

      CREATE TABLE IF NOT EXISTS basket_affinity_snapshots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        related_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        snapshot_date DATE NOT NULL,
        order_count INT NOT NULL DEFAULT 0,
        support NUMERIC(8,4) NOT NULL DEFAULT 0,
        confidence NUMERIC(8,4) NOT NULL DEFAULT 0,
        lift NUMERIC(8,4) NOT NULL DEFAULT 0,
        affinity_score NUMERIC(8,2) NOT NULL DEFAULT 0,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_basket_affinity_snapshots_pair ON basket_affinity_snapshots(tenant_id, product_id, related_product_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_basket_affinity_snapshots_pair;
      DROP TABLE IF EXISTS basket_affinity_snapshots;
      DROP INDEX IF EXISTS idx_churn_risk_snapshots_tenant_band;
      DROP INDEX IF EXISTS idx_churn_risk_snapshots_tenant_customer_date;
      DROP TABLE IF EXISTS churn_risk_snapshots;
      DROP INDEX IF EXISTS idx_customer_ltv_snapshots_tenant_customer_date;
      DROP TABLE IF EXISTS customer_ltv_snapshots;
      DROP TABLE IF EXISTS customer_segments;
      DROP TABLE IF EXISTS analytics_insight_settings;
    `);
  }
}
