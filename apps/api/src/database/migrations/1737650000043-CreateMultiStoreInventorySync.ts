import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMultiStoreInventorySync1737650000043 implements MigrationInterface {
  name = 'CreateMultiStoreInventorySync1737650000043';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE stock_items
        ADD COLUMN IF NOT EXISTS sync_source VARCHAR(32) NOT NULL DEFAULT 'store',
        ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ NULL,
        ADD COLUMN IF NOT EXISTS safety_stock_level DECIMAL(14, 4) NULL,
        ADD COLUMN IF NOT EXISTS reorder_point DECIMAL(14, 4) NULL;

      UPDATE stock_items
      SET reorder_point = reorder_level
      WHERE reorder_point IS NULL AND reorder_level IS NOT NULL;

      CREATE TABLE IF NOT EXISTS inventory_sync_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        item_id UUID NULL REFERENCES products(id) ON DELETE SET NULL,
        from_location_id UUID NULL REFERENCES locations(id) ON DELETE SET NULL,
        to_location_id UUID NULL REFERENCES locations(id) ON DELETE SET NULL,
        quantity DECIMAL(14, 4) NOT NULL DEFAULT 0,
        reason VARCHAR(32) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_inventory_sync_logs_tenant_item_created ON inventory_sync_logs(tenant_id, item_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_inventory_sync_logs_locations ON inventory_sync_logs(from_location_id, to_location_id);

      CREATE TABLE IF NOT EXISTS inventory_snapshots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NULL REFERENCES locations(id) ON DELETE SET NULL,
        snapshot JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_tenant_location_created ON inventory_snapshots(tenant_id, location_id, created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_inventory_snapshots_tenant_location_created;
      DROP TABLE IF EXISTS inventory_snapshots;
      DROP INDEX IF EXISTS idx_inventory_sync_logs_locations;
      DROP INDEX IF EXISTS idx_inventory_sync_logs_tenant_item_created;
      DROP TABLE IF EXISTS inventory_sync_logs;
      ALTER TABLE stock_items
        DROP COLUMN IF EXISTS reorder_point,
        DROP COLUMN IF EXISTS safety_stock_level,
        DROP COLUMN IF EXISTS last_synced_at,
        DROP COLUMN IF EXISTS sync_source;
    `);
  }
}
