import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOfflineEdgeSync1737650000078 implements MigrationInterface {
  name = 'CreateOfflineEdgeSync1737650000078';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS edge_devices (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        device_fingerprint VARCHAR(160) NOT NULL,
        device_type VARCHAR(32) NOT NULL,
        display_name VARCHAR(160) NOT NULL,
        status VARCHAR(24) NOT NULL DEFAULT 'active',
        offline_token_hash VARCHAR(128),
        storage_key_fingerprint VARCHAR(128),
        last_seen_at TIMESTAMPTZ,
        capabilities JSONB NOT NULL DEFAULT '{}',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, location_id, device_fingerprint)
      );

      CREATE TABLE IF NOT EXISTS offline_location_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        offline_mode_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        allow_pos_sales BOOLEAN NOT NULL DEFAULT TRUE,
        allow_warehouse_ops BOOLEAN NOT NULL DEFAULT TRUE,
        allow_delivery_ops BOOLEAN NOT NULL DEFAULT TRUE,
        allow_kiosk_orders BOOLEAN NOT NULL DEFAULT TRUE,
        require_device_binding BOOLEAN NOT NULL DEFAULT TRUE,
        max_offline_minutes INT NOT NULL DEFAULT 720,
        delta_retention_days INT NOT NULL DEFAULT 14,
        policy JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, location_id)
      );

      CREATE TABLE IF NOT EXISTS offline_sync_operations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        device_id UUID REFERENCES edge_devices(id) ON DELETE SET NULL,
        client_mutation_id VARCHAR(160) NOT NULL,
        source_app VARCHAR(32) NOT NULL,
        entity_type VARCHAR(64) NOT NULL,
        entity_id VARCHAR(160),
        operation_type VARCHAR(32) NOT NULL,
        base_revision INT,
        server_revision INT NOT NULL DEFAULT 1,
        status VARCHAR(24) NOT NULL DEFAULT 'queued',
        conflict_strategy VARCHAR(32) NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}',
        server_snapshot JSONB NOT NULL DEFAULT '{}',
        attempts INT NOT NULL DEFAULT 0,
        next_retry_at TIMESTAMPTZ,
        error_message TEXT,
        occurred_at TIMESTAMPTZ NOT NULL,
        applied_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, client_mutation_id)
      );

      CREATE TABLE IF NOT EXISTS offline_sync_conflicts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        operation_id UUID NOT NULL REFERENCES offline_sync_operations(id) ON DELETE CASCADE,
        entity_type VARCHAR(64) NOT NULL,
        entity_id VARCHAR(160),
        conflict_type VARCHAR(64) NOT NULL,
        resolution_strategy VARCHAR(32) NOT NULL,
        status VARCHAR(24) NOT NULL DEFAULT 'open',
        client_payload JSONB NOT NULL DEFAULT '{}',
        server_payload JSONB NOT NULL DEFAULT '{}',
        resolution_outcome JSONB NOT NULL DEFAULT '{}',
        resolved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        resolved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS offline_sync_cursors (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        device_id UUID NOT NULL REFERENCES edge_devices(id) ON DELETE CASCADE,
        last_cursor VARCHAR(80) NOT NULL DEFAULT '0',
        last_pull_at TIMESTAMPTZ,
        last_push_at TIMESTAMPTZ,
        UNIQUE (tenant_id, location_id, device_id)
      );

      CREATE TABLE IF NOT EXISTS offline_sync_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
        device_id UUID REFERENCES edge_devices(id) ON DELETE SET NULL,
        event_type VARCHAR(64) NOT NULL,
        level VARCHAR(16) NOT NULL DEFAULT 'info',
        message TEXT NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_edge_devices_status ON edge_devices (tenant_id, status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_offline_operations_created ON offline_sync_operations (tenant_id, location_id, created_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_offline_operations_retry ON offline_sync_operations (tenant_id, status, next_retry_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_offline_conflicts_status ON offline_sync_conflicts (tenant_id, location_id, status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_offline_conflicts_operation ON offline_sync_conflicts (tenant_id, operation_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_offline_logs_created ON offline_sync_logs (tenant_id, location_id, created_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_offline_logs_event_type ON offline_sync_logs (tenant_id, event_type)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_offline_logs_event_type`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_offline_logs_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_offline_conflicts_operation`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_offline_conflicts_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_offline_operations_retry`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_offline_operations_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_edge_devices_status`);
    await queryRunner.query(`DROP TABLE IF EXISTS offline_sync_logs`);
    await queryRunner.query(`DROP TABLE IF EXISTS offline_sync_cursors`);
    await queryRunner.query(`DROP TABLE IF EXISTS offline_sync_conflicts`);
    await queryRunner.query(`DROP TABLE IF EXISTS offline_sync_operations`);
    await queryRunner.query(`DROP TABLE IF EXISTS offline_location_settings`);
    await queryRunner.query(`DROP TABLE IF EXISTS edge_devices`);
  }
}
