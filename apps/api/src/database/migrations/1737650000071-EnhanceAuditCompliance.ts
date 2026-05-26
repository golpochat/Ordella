import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceAuditCompliance1737650000071 implements MigrationInterface {
  name = 'EnhanceAuditCompliance1737650000071';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_type VARCHAR(24) NOT NULL DEFAULT 'system'`);
    await queryRunner.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS source VARCHAR(48) NOT NULL DEFAULT 'api'`);
    await queryRunner.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS status VARCHAR(24) NOT NULL DEFAULT 'success'`);
    await queryRunner.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS risk_level VARCHAR(16) NOT NULL DEFAULT 'low'`);
    await queryRunner.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS request_id VARCHAR(128)`);
    await queryRunner.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS previous_hash VARCHAR(128)`);
    await queryRunner.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS hash VARCHAR(128)`);
    await queryRunner.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS retention_until TIMESTAMPTZ`);
    await queryRunner.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS legal_hold BOOLEAN NOT NULL DEFAULT false`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_status_created ON audit_logs (tenant_id, status, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_risk_created ON audit_logs (tenant_id, risk_level, created_at DESC)`);
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
      RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'audit_logs are immutable';
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`DROP TRIGGER IF EXISTS audit_logs_immutable_update ON audit_logs`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS audit_logs_immutable_delete ON audit_logs`);
    await queryRunner.query(`
      CREATE TRIGGER audit_logs_immutable_update
      BEFORE UPDATE ON audit_logs
      FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation()
    `);
    await queryRunner.query(`
      CREATE TRIGGER audit_logs_immutable_delete
      BEFORE DELETE ON audit_logs
      FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS audit_logs_immutable_delete ON audit_logs`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS audit_logs_immutable_update ON audit_logs`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS prevent_audit_log_mutation`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_logs_tenant_risk_created`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_logs_tenant_status_created`);
    await queryRunner.query(`ALTER TABLE audit_logs DROP COLUMN IF EXISTS legal_hold`);
    await queryRunner.query(`ALTER TABLE audit_logs DROP COLUMN IF EXISTS retention_until`);
    await queryRunner.query(`ALTER TABLE audit_logs DROP COLUMN IF EXISTS hash`);
    await queryRunner.query(`ALTER TABLE audit_logs DROP COLUMN IF EXISTS previous_hash`);
    await queryRunner.query(`ALTER TABLE audit_logs DROP COLUMN IF EXISTS request_id`);
    await queryRunner.query(`ALTER TABLE audit_logs DROP COLUMN IF EXISTS risk_level`);
    await queryRunner.query(`ALTER TABLE audit_logs DROP COLUMN IF EXISTS status`);
    await queryRunner.query(`ALTER TABLE audit_logs DROP COLUMN IF EXISTS source`);
    await queryRunner.query(`ALTER TABLE audit_logs DROP COLUMN IF EXISTS actor_type`);
  }
}
