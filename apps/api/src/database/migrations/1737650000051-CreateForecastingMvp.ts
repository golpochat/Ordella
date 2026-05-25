import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateForecastingMvp1737650000051 implements MigrationInterface {
  name = 'CreateForecastingMvp1737650000051';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS forecast_snapshots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        forecast_type VARCHAR(64) NOT NULL,
        location_id UUID NULL REFERENCES locations(id) ON DELETE SET NULL,
        horizon_days INT NOT NULL DEFAULT 7,
        cache_key VARCHAR(512) NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}',
        generated_for_date DATE NOT NULL,
        confidence DECIMAL(6,4) NULL,
        generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_forecast_snapshots_tenant_type_date ON forecast_snapshots(tenant_id, forecast_type, generated_for_date);
      CREATE INDEX IF NOT EXISTS idx_forecast_snapshots_tenant_type_cache ON forecast_snapshots(tenant_id, forecast_type, cache_key);

      CREATE TABLE IF NOT EXISTS forecast_model_configs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        model_type VARCHAR(64) NOT NULL,
        parameters JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NULL
      );
      CREATE INDEX IF NOT EXISTS idx_forecast_model_configs_tenant_type_active ON forecast_model_configs(tenant_id, model_type, is_active);

      CREATE INDEX IF NOT EXISTS idx_orders_forecast_history ON orders(tenant_id, created_at, location_id, order_type);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_forecast_history ON stock_movements(tenant_id, created_at, stock_item_id);
      CREATE INDEX IF NOT EXISTS idx_forecast_pick_tasks ON warehouse_pick_tasks(tenant_id, created_at, warehouse_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_forecast_pick_tasks;
      DROP INDEX IF EXISTS idx_stock_movements_forecast_history;
      DROP INDEX IF EXISTS idx_orders_forecast_history;
      DROP INDEX IF EXISTS idx_forecast_model_configs_tenant_type_active;
      DROP TABLE IF EXISTS forecast_model_configs;
      DROP INDEX IF EXISTS idx_forecast_snapshots_tenant_type_cache;
      DROP INDEX IF EXISTS idx_forecast_snapshots_tenant_type_date;
      DROP TABLE IF EXISTS forecast_snapshots;
    `);
  }
}
