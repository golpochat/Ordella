import { MigrationInterface, QueryRunner } from 'typeorm';

/** Delivery core columns/events for Delivery domain orchestration */
export class AddDeliveryCoreColumns1737650000016 implements MigrationInterface {
  name = 'AddDeliveryCoreColumns1737650000016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE driver_profiles
        ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

      ALTER TABLE delivery_tasks
        ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';

      CREATE TABLE IF NOT EXISTS delivery_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        delivery_task_id UUID NOT NULL REFERENCES delivery_tasks(id) ON DELETE CASCADE,
        type VARCHAR(64) NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_delivery_events_tenant_task_created
        ON delivery_events (tenant_id, delivery_task_id, created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_delivery_events_tenant_task_created;
      DROP TABLE IF EXISTS delivery_events;

      ALTER TABLE delivery_tasks
        DROP COLUMN IF EXISTS metadata,
        DROP COLUMN IF EXISTS completed_at,
        DROP COLUMN IF EXISTS started_at;

      ALTER TABLE driver_profiles
        DROP COLUMN IF EXISTS active;
    `);
  }
}
