import { MigrationInterface, QueryRunner } from 'typeorm';

export class SubscriptionMembershipEngine1737650000069 implements MigrationInterface {
  name = 'SubscriptionMembershipEngine1737650000069';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        name VARCHAR(120) NOT NULL,
        price DECIMAL(12, 2) NOT NULL,
        billing_cycle VARCHAR(16) NOT NULL,
        perks JSONB NOT NULL DEFAULT '{}',
        trial_period_days INT NOT NULL DEFAULT 0,
        status VARCHAR(16) NOT NULL DEFAULT 'active',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_subscription_plans_tenant_status ON subscription_plans (tenant_id, status)`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions ALTER COLUMN location_id DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions ALTER COLUMN schedule DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(16)`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions ADD COLUMN IF NOT EXISTS renewal_date TIMESTAMPTZ`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions ADD COLUMN IF NOT EXISTS failed_payment_attempts INT NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions ADD COLUMN IF NOT EXISTS last_payment_failed_at TIMESTAMPTZ`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions ADD COLUMN IF NOT EXISTS refund_policy JSONB NOT NULL DEFAULT '{}'`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_plan ON customer_subscriptions (tenant_id, plan_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customer_subscriptions_plan`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions DROP COLUMN IF EXISTS refund_policy`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions DROP COLUMN IF EXISTS last_payment_failed_at`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions DROP COLUMN IF EXISTS failed_payment_attempts`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions DROP COLUMN IF EXISTS cancel_at_period_end`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions DROP COLUMN IF EXISTS canceled_at`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions DROP COLUMN IF EXISTS renewal_date`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions DROP COLUMN IF EXISTS start_date`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions DROP COLUMN IF EXISTS billing_cycle`);
    await queryRunner.query(`ALTER TABLE customer_subscriptions DROP COLUMN IF EXISTS plan_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_subscription_plans_tenant_status`);
    await queryRunner.query(`DROP TABLE IF EXISTS subscription_plans`);
  }
}
