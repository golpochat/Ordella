import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderPaymentColumns1737650000012 implements MigrationInterface {
  name = 'AddOrderPaymentColumns1737650000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS payment_status VARCHAR(32) NOT NULL DEFAULT 'unpaid',
        ADD COLUMN IF NOT EXISTS payment_method VARCHAR(32);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
        DROP COLUMN IF EXISTS payment_method,
        DROP COLUMN IF EXISTS payment_status;
    `);
  }
}
