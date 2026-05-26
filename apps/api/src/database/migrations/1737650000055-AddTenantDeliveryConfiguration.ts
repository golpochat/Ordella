import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTenantDeliveryConfiguration1737650000055 implements MigrationInterface {
  name = 'AddTenantDeliveryConfiguration1737650000055';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tenant_settings
        ADD COLUMN IF NOT EXISTS delivery_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS minimum_order_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS free_delivery_threshold DECIMAL(12,2) NULL,
        ADD COLUMN IF NOT EXISTS delivery_radius_km DECIMAL(8,2) NOT NULL DEFAULT 5,
        ADD COLUMN IF NOT EXISTS delivery_zones JSONB NOT NULL DEFAULT '[]';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tenant_settings
        DROP COLUMN IF EXISTS delivery_zones,
        DROP COLUMN IF EXISTS delivery_radius_km,
        DROP COLUMN IF EXISTS free_delivery_threshold,
        DROP COLUMN IF EXISTS minimum_order_amount,
        DROP COLUMN IF EXISTS delivery_fee,
        DROP COLUMN IF EXISTS delivery_enabled;
    `);
  }
}

