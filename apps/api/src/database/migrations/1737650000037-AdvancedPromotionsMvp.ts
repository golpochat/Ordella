import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdvancedPromotionsMvp1737650000037 implements MigrationInterface {
  name = 'AdvancedPromotionsMvp1737650000037';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE promotions
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS buy_quantity INT,
        ADD COLUMN IF NOT EXISTS get_quantity INT,
        ADD COLUMN IF NOT EXISTS min_spend DECIMAL(12, 2),
        ADD COLUMN IF NOT EXISTS applicable_locations UUID[] NOT NULL DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS applicable_categories UUID[] NOT NULL DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS applicable_items UUID[] NOT NULL DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS auto_apply BOOLEAN NOT NULL DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS channel VARCHAR(16) NOT NULL DEFAULT 'both';

      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS discount_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS promotion_ids UUID[] NOT NULL DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS applied_promotions JSONB NOT NULL DEFAULT '[]';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
        DROP COLUMN IF EXISTS applied_promotions,
        DROP COLUMN IF EXISTS promotion_ids,
        DROP COLUMN IF EXISTS discount_total;

      ALTER TABLE promotions
        DROP COLUMN IF EXISTS channel,
        DROP COLUMN IF EXISTS auto_apply,
        DROP COLUMN IF EXISTS applicable_items,
        DROP COLUMN IF EXISTS applicable_categories,
        DROP COLUMN IF EXISTS applicable_locations,
        DROP COLUMN IF EXISTS min_spend,
        DROP COLUMN IF EXISTS get_quantity,
        DROP COLUMN IF EXISTS buy_quantity,
        DROP COLUMN IF EXISTS description;
    `);
  }
}
