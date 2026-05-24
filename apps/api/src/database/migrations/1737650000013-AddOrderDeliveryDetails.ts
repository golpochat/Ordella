import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderDeliveryDetails1737650000013 implements MigrationInterface {
  name = 'AddOrderDeliveryDetails1737650000013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS delivery_details JSONB;

      UPDATE orders
        SET status = 'out_for_delivery'
        WHERE status = 'dispatched';

      UPDATE orders
        SET status = 'completed'
        WHERE status = 'delivered';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE orders
        SET status = 'dispatched'
        WHERE status = 'out_for_delivery';

      UPDATE orders
        SET status = 'delivered'
        WHERE status = 'completed';

      ALTER TABLE orders
        DROP COLUMN IF EXISTS delivery_details;
    `);
  }
}
