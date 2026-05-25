import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReplenishmentMvp1737650000052 implements MigrationInterface {
  name = 'CreateReplenishmentMvp1737650000052';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS replenishment_rules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        item_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        rule_type VARCHAR(32) NOT NULL,
        min_level DECIMAL(14,4) NULL,
        max_level DECIMAL(14,4) NULL,
        safety_stock DECIMAL(14,4) NULL,
        reorder_multiple DECIMAL(14,4) NULL,
        supplier_id UUID NULL REFERENCES suppliers(id) ON DELETE SET NULL,
        source_location_id UUID NULL REFERENCES locations(id) ON DELETE SET NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NULL
      );
      CREATE INDEX IF NOT EXISTS idx_replenishment_rules_tenant_location_item ON replenishment_rules(tenant_id, location_id, item_id);

      CREATE TABLE IF NOT EXISTS replenishment_actions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        rule_id UUID NULL REFERENCES replenishment_rules(id) ON DELETE SET NULL,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        item_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        stock_item_id UUID NULL REFERENCES stock_items(id) ON DELETE SET NULL,
        action_type VARCHAR(32) NOT NULL,
        quantity DECIMAL(14,4) NOT NULL,
        source_location_id UUID NULL REFERENCES locations(id) ON DELETE SET NULL,
        supplier_id UUID NULL REFERENCES suppliers(id) ON DELETE SET NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        purchase_order_id UUID NULL REFERENCES purchase_orders(id) ON DELETE SET NULL,
        stock_transfer_id UUID NULL REFERENCES stock_transfers(id) ON DELETE SET NULL,
        pick_task_id UUID NULL REFERENCES warehouse_pick_tasks(id) ON DELETE SET NULL,
        reason TEXT NULL,
        metadata JSONB NOT NULL DEFAULT '{}',
        error TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NULL
      );
      CREATE INDEX IF NOT EXISTS idx_replenishment_actions_tenant_status_created ON replenishment_actions(tenant_id, status, created_at);
      CREATE INDEX IF NOT EXISTS idx_replenishment_actions_tenant_location_item_status ON replenishment_actions(tenant_id, location_id, item_id, status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_replenishment_actions_tenant_location_item_status;
      DROP INDEX IF EXISTS idx_replenishment_actions_tenant_status_created;
      DROP TABLE IF EXISTS replenishment_actions;
      DROP INDEX IF EXISTS idx_replenishment_rules_tenant_location_item;
      DROP TABLE IF EXISTS replenishment_rules;
    `);
  }
}
