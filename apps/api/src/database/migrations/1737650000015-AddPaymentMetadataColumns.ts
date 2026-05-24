import { MigrationInterface, QueryRunner } from 'typeorm';

/** Payment metadata + attempt error_code for domain orchestration */
export class AddPaymentMetadataColumns1737650000015 implements MigrationInterface {
  name = 'AddPaymentMetadataColumns1737650000015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE payments
        ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';

      ALTER TABLE payment_attempts
        ADD COLUMN IF NOT EXISTS error_code VARCHAR(64);

      CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_tenant_order_unique
        ON payments (tenant_id, order_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_payments_tenant_order_unique;
      ALTER TABLE payment_attempts DROP COLUMN IF EXISTS error_code;
      ALTER TABLE payments DROP COLUMN IF EXISTS metadata;
    `);
  }
}
