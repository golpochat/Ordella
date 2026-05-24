import { MigrationInterface, QueryRunner } from 'typeorm';

/** ERD §1.3 + SRS §4 — inventory / stock schema */
export class CreateInventorySchema1737650000004 implements MigrationInterface {
  name = 'CreateInventorySchema1737650000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS stock_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(128) NOT NULL,
        unit VARCHAR(32) NOT NULL,
        quantity_on_hand DECIMAL(14, 4) NOT NULL DEFAULT 0,
        product_id UUID REFERENCES products(id) ON DELETE SET NULL,
        reorder_level DECIMAL(14, 4),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ,
        UNIQUE (tenant_id, location_id, sku)
      );

      CREATE INDEX IF NOT EXISTS idx_stock_items_tenant_id ON stock_items (tenant_id);
      CREATE INDEX IF NOT EXISTS idx_stock_items_location_id ON stock_items (location_id);

      CREATE TABLE IF NOT EXISTS stock_movements (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        stock_item_id UUID NOT NULL REFERENCES stock_items(id) ON DELETE CASCADE,
        type VARCHAR(32) NOT NULL,
        quantity DECIMAL(14, 4) NOT NULL,
        reference_type VARCHAR(32),
        reference_id UUID,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_stock_movements_item_created ON stock_movements (stock_item_id, created_at);

      CREATE TABLE IF NOT EXISTS stock_adjustments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        stock_item_id UUID NOT NULL REFERENCES stock_items(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        quantity_delta DECIMAL(14, 4) NOT NULL,
        reason TEXT,
        adjusted_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS stock_transfers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        from_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
        to_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS stock_transfer_lines (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        transfer_id UUID NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
        stock_item_id UUID NOT NULL REFERENCES stock_items(id) ON DELETE RESTRICT,
        quantity DECIMAL(14, 4) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS stock_reservations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        stock_item_id UUID NOT NULL REFERENCES stock_items(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        quantity DECIMAL(14, 4) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        reference_type VARCHAR(32) NOT NULL,
        reference_id UUID NOT NULL,
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_stock_reservations_item_status ON stock_reservations (stock_item_id, status);

      CREATE TABLE IF NOT EXISTS wastage_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        stock_item_id UUID NOT NULL REFERENCES stock_items(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        quantity DECIMAL(14, 4) NOT NULL,
        reason TEXT,
        recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_wastage_records_tenant_location ON wastage_records (tenant_id, location_id, created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS wastage_records;
      DROP TABLE IF EXISTS stock_reservations;
      DROP TABLE IF EXISTS stock_transfer_lines;
      DROP TABLE IF EXISTS stock_transfers;
      DROP TABLE IF EXISTS stock_adjustments;
      DROP TABLE IF EXISTS stock_movements;
      DROP TABLE IF EXISTS stock_items;
    `);
  }
}
