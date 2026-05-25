import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWarehouseDistributionMvp1737650000042 implements MigrationInterface {
  name = 'CreateWarehouseDistributionMvp1737650000042';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE locations
        ADD COLUMN IF NOT EXISTS location_type VARCHAR(32) NOT NULL DEFAULT 'store';

      ALTER TABLE stock_transfers
        ALTER COLUMN status SET DEFAULT 'draft',
        ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMPTZ NULL,
        ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ NULL,
        ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ NULL;

      ALTER TABLE stock_transfer_lines
        ADD COLUMN IF NOT EXISTS item_id UUID NULL REFERENCES products(id) ON DELETE RESTRICT,
        ADD COLUMN IF NOT EXISTS quantity_requested DECIMAL(14, 4) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS quantity_sent DECIMAL(14, 4) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS quantity_received DECIMAL(14, 4) NOT NULL DEFAULT 0;

      UPDATE stock_transfer_lines
      SET quantity_requested = quantity
      WHERE quantity_requested = 0;

      CREATE INDEX IF NOT EXISTS idx_stock_transfers_from_status ON stock_transfers(tenant_id, from_location_id, status);
      CREATE INDEX IF NOT EXISTS idx_stock_transfers_to_status ON stock_transfers(tenant_id, to_location_id, status);

      CREATE TABLE IF NOT EXISTS warehouse_zones (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        warehouse_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name VARCHAR(128) NOT NULL,
        type VARCHAR(32) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_warehouse_zones_warehouse_name UNIQUE (warehouse_id, name)
      );

      CREATE TABLE IF NOT EXISTS warehouse_bins (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        zone_id UUID NOT NULL REFERENCES warehouse_zones(id) ON DELETE CASCADE,
        code VARCHAR(64) NOT NULL,
        capacity INTEGER NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_warehouse_bins_zone_code UNIQUE (zone_id, code)
      );

      CREATE TABLE IF NOT EXISTS warehouse_bin_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        bin_id UUID NOT NULL REFERENCES warehouse_bins(id) ON DELETE CASCADE,
        item_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity DECIMAL(14, 4) NOT NULL DEFAULT 0,
        CONSTRAINT uq_warehouse_bin_items_bin_item UNIQUE (bin_id, item_id)
      );

      CREATE TABLE IF NOT EXISTS warehouse_pick_tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        warehouse_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        transfer_id UUID NULL REFERENCES stock_transfers(id) ON DELETE SET NULL,
        order_id UUID NULL REFERENCES orders(id) ON DELETE SET NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        assigned_to UUID NULL REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_warehouse_pick_tasks_warehouse_status ON warehouse_pick_tasks(warehouse_id, status);
      CREATE INDEX IF NOT EXISTS idx_warehouse_pick_tasks_tenant_status ON warehouse_pick_tasks(tenant_id, status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_warehouse_pick_tasks_tenant_status;
      DROP INDEX IF EXISTS idx_warehouse_pick_tasks_warehouse_status;
      DROP TABLE IF EXISTS warehouse_pick_tasks;
      DROP TABLE IF EXISTS warehouse_bin_items;
      DROP TABLE IF EXISTS warehouse_bins;
      DROP TABLE IF EXISTS warehouse_zones;
      DROP INDEX IF EXISTS idx_stock_transfers_to_status;
      DROP INDEX IF EXISTS idx_stock_transfers_from_status;
      ALTER TABLE stock_transfer_lines
        DROP COLUMN IF EXISTS quantity_received,
        DROP COLUMN IF EXISTS quantity_sent,
        DROP COLUMN IF EXISTS quantity_requested,
        DROP COLUMN IF EXISTS item_id;
      ALTER TABLE stock_transfers
        DROP COLUMN IF EXISTS cancelled_at,
        DROP COLUMN IF EXISTS received_at,
        DROP COLUMN IF EXISTS dispatched_at,
        ALTER COLUMN status SET DEFAULT 'pending';
      ALTER TABLE locations DROP COLUMN IF EXISTS location_type;
    `);
  }
}
