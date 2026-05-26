import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSupplierItemCaseSize1737650000058 implements MigrationInterface {
  name = 'AddSupplierItemCaseSize1737650000058';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE supplier_items
        ADD COLUMN IF NOT EXISTS case_size INTEGER NOT NULL DEFAULT 1;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE supplier_items
        DROP COLUMN IF EXISTS case_size;
    `);
  }
}
