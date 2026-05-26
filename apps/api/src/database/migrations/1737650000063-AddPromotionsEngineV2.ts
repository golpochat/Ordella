import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPromotionsEngineV21737650000063 implements MigrationInterface {
  name = 'AddPromotionsEngineV21737650000063';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE promotions
        ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 100,
        ADD COLUMN IF NOT EXISTS stackable BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS conflict_strategy VARCHAR(32) NOT NULL DEFAULT 'best_price',
        ADD COLUMN IF NOT EXISTS eligible_customer_segments VARCHAR[] NOT NULL DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS dynamic_pricing_rules JSONB NOT NULL DEFAULT '{}';

      CREATE INDEX IF NOT EXISTS idx_promotions_tenant_priority ON promotions(tenant_id, priority);
      CREATE INDEX IF NOT EXISTS idx_promotions_tenant_channel_active ON promotions(tenant_id, channel, is_active);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_promotions_tenant_channel_active;
      DROP INDEX IF EXISTS idx_promotions_tenant_priority;
      ALTER TABLE promotions
        DROP COLUMN IF EXISTS dynamic_pricing_rules,
        DROP COLUMN IF EXISTS eligible_customer_segments,
        DROP COLUMN IF EXISTS conflict_strategy,
        DROP COLUMN IF EXISTS stackable,
        DROP COLUMN IF EXISTS priority;
    `);
  }
}
