import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoutingEngineMvp1737650000049 implements MigrationInterface {
  name = 'CreateRoutingEngineMvp1737650000049';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE locations
        ADD COLUMN IF NOT EXISTS delivery_zones JSONB NOT NULL DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS routing_priority INT NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS fulfillment_capacity INT NOT NULL DEFAULT 20,
        ADD COLUMN IF NOT EXISTS supports_delivery BOOLEAN NOT NULL DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS supports_pickup BOOLEAN NOT NULL DEFAULT TRUE;
      CREATE INDEX IF NOT EXISTS idx_locations_tenant_routing ON locations(tenant_id, supports_delivery, supports_pickup, routing_priority);

      CREATE TABLE IF NOT EXISTS routing_rules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        rule_type VARCHAR(32) NOT NULL,
        value JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NULL
      );
      CREATE INDEX IF NOT EXISTS idx_routing_rules_tenant_type ON routing_rules(tenant_id, rule_type);

      CREATE TABLE IF NOT EXISTS routing_decisions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        order_id UUID NULL REFERENCES orders(id) ON DELETE SET NULL,
        from_location_id UUID NULL REFERENCES locations(id) ON DELETE SET NULL,
        to_location_id UUID NULL REFERENCES locations(id) ON DELETE SET NULL,
        reason TEXT NOT NULL,
        estimated_delivery_minutes INT NULL,
        fallback_options JSONB NOT NULL DEFAULT '[]',
        input_snapshot JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_routing_decisions_tenant_created ON routing_decisions(tenant_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_routing_decisions_tenant_to_location ON routing_decisions(tenant_id, to_location_id);
      CREATE INDEX IF NOT EXISTS idx_routing_decisions_tenant_order ON routing_decisions(tenant_id, order_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_routing_decisions_tenant_order;
      DROP INDEX IF EXISTS idx_routing_decisions_tenant_to_location;
      DROP INDEX IF EXISTS idx_routing_decisions_tenant_created;
      DROP TABLE IF EXISTS routing_decisions;
      DROP INDEX IF EXISTS idx_routing_rules_tenant_type;
      DROP TABLE IF EXISTS routing_rules;
      DROP INDEX IF EXISTS idx_locations_tenant_routing;
      ALTER TABLE locations
        DROP COLUMN IF EXISTS supports_pickup,
        DROP COLUMN IF EXISTS supports_delivery,
        DROP COLUMN IF EXISTS fulfillment_capacity,
        DROP COLUMN IF EXISTS routing_priority,
        DROP COLUMN IF EXISTS delivery_zones;
    `);
  }
}
