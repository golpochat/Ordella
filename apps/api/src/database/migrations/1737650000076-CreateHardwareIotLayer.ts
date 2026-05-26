import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHardwareIotLayer1737650000076 implements MigrationInterface {
  name = 'CreateHardwareIotLayer1737650000076';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS hardware_devices (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        device_id VARCHAR(128) NOT NULL,
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        device_type VARCHAR(48) NOT NULL,
        display_name VARCHAR(160) NOT NULL,
        status VARCHAR(24) NOT NULL DEFAULT 'offline',
        last_heartbeat_at TIMESTAMPTZ,
        firmware_version VARCHAR(64),
        auth_token_hash VARCHAR(128),
        supports_encryption BOOLEAN NOT NULL DEFAULT FALSE,
        config JSONB NOT NULL DEFAULT '{}',
        capabilities JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, device_id)
      );

      CREATE TABLE IF NOT EXISTS hardware_device_commands (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        device_pk UUID NOT NULL REFERENCES hardware_devices(id) ON DELETE CASCADE,
        device_id VARCHAR(128) NOT NULL,
        command_type VARCHAR(64) NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}',
        status VARCHAR(24) NOT NULL DEFAULT 'queued',
        response_payload JSONB,
        error_message TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        sent_at TIMESTAMPTZ,
        acknowledged_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS hardware_device_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        device_pk UUID NOT NULL REFERENCES hardware_devices(id) ON DELETE CASCADE,
        device_id VARCHAR(128) NOT NULL,
        event_type VARCHAR(64) NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}',
        status VARCHAR(24) NOT NULL DEFAULT 'received',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS hardware_device_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        device_pk UUID NOT NULL REFERENCES hardware_devices(id) ON DELETE CASCADE,
        device_id VARCHAR(128) NOT NULL,
        level VARCHAR(16) NOT NULL DEFAULT 'info',
        action VARCHAR(64) NOT NULL,
        message TEXT,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_hardware_devices_location_status ON hardware_devices (tenant_id, location_id, status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_hardware_commands_status ON hardware_device_commands (tenant_id, device_id, status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_hardware_events_type ON hardware_device_events (tenant_id, device_id, event_type)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_hardware_events_location_created ON hardware_device_events (tenant_id, location_id, created_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_hardware_logs_device_created ON hardware_device_logs (tenant_id, device_id, created_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_hardware_logs_level ON hardware_device_logs (tenant_id, level)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_hardware_logs_level`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_hardware_logs_device_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_hardware_events_location_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_hardware_events_type`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_hardware_commands_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_hardware_devices_location_status`);
    await queryRunner.query(`DROP TABLE IF EXISTS hardware_device_logs`);
    await queryRunner.query(`DROP TABLE IF EXISTS hardware_device_events`);
    await queryRunner.query(`DROP TABLE IF EXISTS hardware_device_commands`);
    await queryRunner.query(`DROP TABLE IF EXISTS hardware_devices`);
  }
}
