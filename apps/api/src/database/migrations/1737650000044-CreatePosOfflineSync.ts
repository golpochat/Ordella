import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePosOfflineSync1737650000044 implements MigrationInterface {
  name = 'CreatePosOfflineSync1737650000044';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS pos_offline_order_syncs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        client_order_id UUID NOT NULL,
        order_id UUID NULL REFERENCES orders(id) ON DELETE SET NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        payload JSONB NOT NULL,
        conflicts JSONB NOT NULL DEFAULT '[]',
        error_message TEXT NULL,
        synced_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_pos_offline_syncs_tenant_client
        ON pos_offline_order_syncs(tenant_id, client_order_id);
      CREATE INDEX IF NOT EXISTS idx_pos_offline_syncs_tenant_location_status
        ON pos_offline_order_syncs(tenant_id, location_id, status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_pos_offline_syncs_tenant_location_status;
      DROP INDEX IF EXISTS idx_pos_offline_syncs_tenant_client;
      DROP TABLE IF EXISTS pos_offline_order_syncs;
    `);
  }
}
