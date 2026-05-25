import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStockItemIsActive1737650000025 implements MigrationInterface {
  name = 'AddStockItemIsActive1737650000025';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE stock_items
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE stock_items DROP COLUMN IF EXISTS is_active`);
  }
}
