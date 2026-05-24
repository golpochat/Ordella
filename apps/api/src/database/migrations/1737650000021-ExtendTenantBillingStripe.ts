import { MigrationInterface, QueryRunner } from 'typeorm';

/** Stripe subscription fields and usage counters on tenant_billing */
export class ExtendTenantBillingStripe1737650000021 implements MigrationInterface {
  name = 'ExtendTenantBillingStripe1737650000021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tenant_billing
        ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(32) DEFAULT 'inactive',
        ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS orders_used_period INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS usage_period_start TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS soft_limit_warned BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS hard_limit_exceeded BOOLEAN NOT NULL DEFAULT FALSE
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tenant_billing_stripe_customer
        ON tenant_billing (stripe_customer_id)
        WHERE stripe_customer_id IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tenant_billing_stripe_subscription
        ON tenant_billing (stripe_subscription_id)
        WHERE stripe_subscription_id IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tenant_billing_stripe_subscription`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tenant_billing_stripe_customer`);
    await queryRunner.query(`
      ALTER TABLE tenant_billing
        DROP COLUMN IF EXISTS hard_limit_exceeded,
        DROP COLUMN IF EXISTS soft_limit_warned,
        DROP COLUMN IF EXISTS usage_period_start,
        DROP COLUMN IF EXISTS orders_used_period,
        DROP COLUMN IF EXISTS current_period_end,
        DROP COLUMN IF EXISTS current_period_start,
        DROP COLUMN IF EXISTS trial_ends_at,
        DROP COLUMN IF EXISTS subscription_status,
        DROP COLUMN IF EXISTS stripe_subscription_id,
        DROP COLUMN IF EXISTS stripe_customer_id
    `);
  }
}
