import { MigrationInterface, QueryRunner } from 'typeorm';

export class LoyaltyRewardsEngine1737650000067 implements MigrationInterface {
  name = 'LoyaltyRewardsEngine1737650000067';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE loyalty_settings
      ADD COLUMN IF NOT EXISTS currency VARCHAR(3),
      ADD COLUMN IF NOT EXISTS points_expire_days INTEGER,
      ADD COLUMN IF NOT EXISTS referral_enabled BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS referrer_bonus_points INTEGER NOT NULL DEFAULT 250,
      ADD COLUMN IF NOT EXISTS referee_bonus_points INTEGER NOT NULL DEFAULT 100,
      ADD COLUMN IF NOT EXISTS max_daily_redemptions INTEGER NOT NULL DEFAULT 5,
      ADD COLUMN IF NOT EXISTS max_daily_referrals INTEGER NOT NULL DEFAULT 10
    `);

    await queryRunner.query(`
      ALTER TABLE loyalty_transactions
      ADD COLUMN IF NOT EXISTS points_earned INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS points_redeemed INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS source VARCHAR(32) NOT NULL DEFAULT 'order',
      ADD COLUMN IF NOT EXISTS balance_after INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS reason VARCHAR(255),
      ADD COLUMN IF NOT EXISTS external_ref VARCHAR(128),
      ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'
    `);
    await queryRunner.query(`
      UPDATE loyalty_transactions
      SET
        points_earned = CASE WHEN points > 0 THEN points ELSE 0 END,
        points_redeemed = CASE WHEN points < 0 THEN ABS(points) ELSE 0 END,
        source = CASE
          WHEN type = 'adjustment' THEN 'manual'
          WHEN type = 'redeem' THEN 'order'
          ELSE 'order'
        END
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS loyalty_points (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        points_balance INTEGER NOT NULL DEFAULT 0,
        lifetime_points_earned INTEGER NOT NULL DEFAULT 0,
        lifetime_points_redeemed INTEGER NOT NULL DEFAULT 0,
        current_tier_id UUID,
        current_tier_name VARCHAR(80) NOT NULL DEFAULT 'Member',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_loyalty_points_customer
      ON loyalty_points (tenant_id, customer_id)
    `);
    await queryRunner.query(`
      INSERT INTO loyalty_points (tenant_id, customer_id, points_balance, current_tier_name)
      SELECT tenant_id, id, points_balance, 'Member'
      FROM customers
      ON CONFLICT DO NOTHING
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS loyalty_tiers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        name VARCHAR(80) NOT NULL,
        points_threshold INTEGER NOT NULL DEFAULT 0,
        spend_threshold DECIMAL(12, 2) NOT NULL DEFAULT 0,
        points_multiplier DECIMAL(8, 4) NOT NULL DEFAULT 1,
        discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
        perks JSONB NOT NULL DEFAULT '[]',
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_loyalty_tiers_name
      ON loyalty_tiers (tenant_id, name)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS loyalty_rewards (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        name VARCHAR(120) NOT NULL,
        type VARCHAR(32) NOT NULL,
        points_cost INTEGER NOT NULL DEFAULT 0,
        discount_amount DECIMAL(12, 2),
        discount_percent DECIMAL(5, 2),
        free_item_id UUID,
        tier_names TEXT[] NOT NULL DEFAULT '{}',
        expires_at TIMESTAMPTZ,
        is_active BOOLEAN NOT NULL DEFAULT true,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_active
      ON loyalty_rewards (tenant_id, is_active)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS loyalty_referrals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        referrer_customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        referred_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        code VARCHAR(24) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        referrer_bonus_points INTEGER NOT NULL DEFAULT 0,
        referee_bonus_points INTEGER NOT NULL DEFAULT 0,
        converted_at TIMESTAMPTZ,
        rewarded_at TIMESTAMPTZ,
        fraud_reason VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_loyalty_referrals_code
      ON loyalty_referrals (tenant_id, code)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_loyalty_referrals_referrer
      ON loyalty_referrals (tenant_id, referrer_customer_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_loyalty_referrals_referrer`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_loyalty_referrals_code`);
    await queryRunner.query(`DROP TABLE IF EXISTS loyalty_referrals`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_loyalty_rewards_active`);
    await queryRunner.query(`DROP TABLE IF EXISTS loyalty_rewards`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_loyalty_tiers_name`);
    await queryRunner.query(`DROP TABLE IF EXISTS loyalty_tiers`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_loyalty_points_customer`);
    await queryRunner.query(`DROP TABLE IF EXISTS loyalty_points`);
    await queryRunner.query(`
      ALTER TABLE loyalty_transactions
      DROP COLUMN IF EXISTS metadata,
      DROP COLUMN IF EXISTS external_ref,
      DROP COLUMN IF EXISTS reason,
      DROP COLUMN IF EXISTS balance_after,
      DROP COLUMN IF EXISTS source,
      DROP COLUMN IF EXISTS points_redeemed,
      DROP COLUMN IF EXISTS points_earned
    `);
    await queryRunner.query(`
      ALTER TABLE loyalty_settings
      DROP COLUMN IF EXISTS max_daily_referrals,
      DROP COLUMN IF EXISTS max_daily_redemptions,
      DROP COLUMN IF EXISTS referee_bonus_points,
      DROP COLUMN IF EXISTS referrer_bonus_points,
      DROP COLUMN IF EXISTS referral_enabled,
      DROP COLUMN IF EXISTS points_expire_days,
      DROP COLUMN IF EXISTS currency
    `);
  }
}
