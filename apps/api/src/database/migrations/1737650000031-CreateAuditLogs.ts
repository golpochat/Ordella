import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogs1737650000031 implements MigrationInterface {
  name = 'CreateAuditLogs1737650000031';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        user_id UUID,
        location_id UUID,
        action VARCHAR(128) NOT NULL,
        entity_type VARCHAR(64) NOT NULL,
        entity_id VARCHAR(128),
        metadata JSONB NOT NULL DEFAULT '{}',
        ip_address VARCHAR(64),
        user_agent TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created
      ON audit_logs (tenant_id, created_at DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_entity_created
      ON audit_logs (tenant_id, entity_type, created_at DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_user_created
      ON audit_logs (tenant_id, user_id, created_at DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_location_created
      ON audit_logs (tenant_id, location_id, created_at DESC)
    `);
    await queryRunner.query(`
      INSERT INTO permissions (key, description)
      VALUES ('audit.read', 'Read immutable tenant audit logs')
      ON CONFLICT (key) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM permissions WHERE key = 'audit.read'`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_logs_tenant_location_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_logs_tenant_user_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_logs_tenant_entity_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_logs_tenant_created`);
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs`);
  }
}
