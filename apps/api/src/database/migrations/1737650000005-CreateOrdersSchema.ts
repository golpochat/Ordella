import { MigrationInterface, QueryRunner } from 'typeorm';

/** ERD §1.4 — orders, order_items, order_events + order_status_history (SRS lifecycle) */
export class CreateOrdersSchema1737650000005 implements MigrationInterface {
  name = 'CreateOrdersSchema1737650000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
        customer_id UUID,
        order_type VARCHAR(32) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
        tax DECIMAL(12, 2) NOT NULL DEFAULT 0,
        total DECIMAL(12, 2) NOT NULL DEFAULT 0,
        order_number VARCHAR(32),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_orders_tenant_status ON orders (tenant_id, status);
      CREATE INDEX IF NOT EXISTS idx_orders_tenant_location_created ON orders (tenant_id, location_id, created_at);

      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        variant_id UUID REFERENCES variants(id) ON DELETE SET NULL,
        quantity INT NOT NULL,
        price DECIMAL(12, 2) NOT NULL,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

      CREATE TABLE IF NOT EXISTS order_status_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        from_status VARCHAR(32),
        to_status VARCHAR(32) NOT NULL,
        changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
        reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_order_status_history_order_created ON order_status_history (order_id, created_at);

      CREATE TABLE IF NOT EXISTS order_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        event_type VARCHAR(64) NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_order_events_order_created ON order_events (order_id, created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS order_events;
      DROP TABLE IF EXISTS order_status_history;
      DROP TABLE IF EXISTS order_items;
      DROP TABLE IF EXISTS orders;
    `);
  }
}
