import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDarkStoreMvp1737650000048 implements MigrationInterface {
  name = 'CreateDarkStoreMvp1737650000048';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE locations
        ADD COLUMN IF NOT EXISTS fulfillment_mode VARCHAR(32) NOT NULL DEFAULT 'storefront';
      CREATE INDEX IF NOT EXISTS idx_locations_tenant_fulfillment_mode ON locations(tenant_id, fulfillment_mode);

      CREATE TABLE IF NOT EXISTS pick_waves (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        picker_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_pick_waves_tenant_location_status ON pick_waves(tenant_id, location_id, status);

      CREATE TABLE IF NOT EXISTS fulfillment_slots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        capacity INT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_fulfillment_slots_tenant_location_start ON fulfillment_slots(tenant_id, location_id, start_time);

      ALTER TABLE warehouse_pick_tasks
        ADD COLUMN IF NOT EXISTS priority INT NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS batch_id UUID NULL,
        ADD COLUMN IF NOT EXISTS wave_id UUID NULL REFERENCES pick_waves(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS slot_id UUID NULL REFERENCES fulfillment_slots(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NULL,
        ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ NULL;
      CREATE INDEX IF NOT EXISTS idx_warehouse_pick_tasks_batch ON warehouse_pick_tasks(tenant_id, batch_id);
      CREATE INDEX IF NOT EXISTS idx_warehouse_pick_tasks_wave ON warehouse_pick_tasks(tenant_id, wave_id);
      CREATE INDEX IF NOT EXISTS idx_warehouse_pick_tasks_priority ON warehouse_pick_tasks(tenant_id, warehouse_id, priority);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_warehouse_pick_tasks_priority;
      DROP INDEX IF EXISTS idx_warehouse_pick_tasks_wave;
      DROP INDEX IF EXISTS idx_warehouse_pick_tasks_batch;
      ALTER TABLE warehouse_pick_tasks
        DROP COLUMN IF EXISTS completed_at,
        DROP COLUMN IF EXISTS started_at,
        DROP COLUMN IF EXISTS slot_id,
        DROP COLUMN IF EXISTS wave_id,
        DROP COLUMN IF EXISTS batch_id,
        DROP COLUMN IF EXISTS priority;
      DROP INDEX IF EXISTS idx_fulfillment_slots_tenant_location_start;
      DROP TABLE IF EXISTS fulfillment_slots;
      DROP INDEX IF EXISTS idx_pick_waves_tenant_location_status;
      DROP TABLE IF EXISTS pick_waves;
      DROP INDEX IF EXISTS idx_locations_tenant_fulfillment_mode;
      ALTER TABLE locations DROP COLUMN IF EXISTS fulfillment_mode;
    `);
  }
}
