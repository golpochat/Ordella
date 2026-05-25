import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProcurementMvp1737650000041 implements MigrationInterface {
  name = 'CreateProcurementMvp1737650000041';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE stock_items
        ADD COLUMN IF NOT EXISTS last_received_at TIMESTAMPTZ NULL;

      CREATE TABLE IF NOT EXISTS suppliers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255) NULL,
        email VARCHAR(255) NULL,
        phone VARCHAR(64) NULL,
        address TEXT NULL,
        notes TEXT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_suppliers_tenant_name ON suppliers(tenant_id, name);

      CREATE TABLE IF NOT EXISTS supplier_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
        item_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
        sku VARCHAR(128) NULL,
        lead_time_days INTEGER NOT NULL DEFAULT 0,
        min_order_qty INTEGER NOT NULL DEFAULT 1,
        CONSTRAINT uq_supplier_items_supplier_item UNIQUE (supplier_id, item_id)
      );
      CREATE INDEX IF NOT EXISTS idx_supplier_items_item_id ON supplier_items(item_id);

      CREATE TABLE IF NOT EXISTS purchase_orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
        status VARCHAR(32) NOT NULL DEFAULT 'draft',
        total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
        expected_delivery_date DATE NULL,
        sent_at TIMESTAMPTZ NULL,
        received_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NULL
      );
      CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_status ON purchase_orders(tenant_id, status);
      CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant_location_created ON purchase_orders(tenant_id, location_id, created_at);

      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
        item_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        quantity_ordered INTEGER NOT NULL,
        quantity_received INTEGER NOT NULL DEFAULT 0,
        cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_purchase_order_items_order_id ON purchase_order_items(purchase_order_id);
      CREATE INDEX IF NOT EXISTS idx_purchase_order_items_item_id ON purchase_order_items(item_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_purchase_order_items_item_id;
      DROP INDEX IF EXISTS idx_purchase_order_items_order_id;
      DROP TABLE IF EXISTS purchase_order_items;
      DROP INDEX IF EXISTS idx_purchase_orders_tenant_location_created;
      DROP INDEX IF EXISTS idx_purchase_orders_tenant_status;
      DROP TABLE IF EXISTS purchase_orders;
      DROP INDEX IF EXISTS idx_supplier_items_item_id;
      DROP TABLE IF EXISTS supplier_items;
      DROP INDEX IF EXISTS idx_suppliers_tenant_name;
      DROP TABLE IF EXISTS suppliers;
      ALTER TABLE stock_items DROP COLUMN IF EXISTS last_received_at;
    `);
  }
}
