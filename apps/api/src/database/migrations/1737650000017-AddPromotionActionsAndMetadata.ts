import { MigrationInterface, QueryRunner } from 'typeorm';

/** Promotion actions table + metadata columns for domain orchestration */
export class AddPromotionActionsAndMetadata1737650000017 implements MigrationInterface {
  name = 'AddPromotionActionsAndMetadata1737650000017';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE promotions
        ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';

      ALTER TABLE promotion_applications
        ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';

      CREATE TABLE IF NOT EXISTS promotion_actions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
        action_type VARCHAR(32) NOT NULL,
        action_config JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_promotion_actions_promotion_id
        ON promotion_actions (promotion_id);

      CREATE UNIQUE INDEX IF NOT EXISTS idx_promotions_tenant_code_unique
        ON promotions (tenant_id, code)
        WHERE code IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_promotions_tenant_code_unique;
      DROP INDEX IF EXISTS idx_promotion_actions_promotion_id;
      DROP TABLE IF EXISTS promotion_actions;

      ALTER TABLE promotion_applications DROP COLUMN IF EXISTS metadata;
      ALTER TABLE promotions DROP COLUMN IF EXISTS metadata;
    `);
  }
}
