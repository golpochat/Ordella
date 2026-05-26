import { MigrationInterface, QueryRunner } from 'typeorm';

export class CustomerAccounts21737650000066 implements MigrationInterface {
  name = 'CustomerAccounts21737650000066';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS date_of_birth DATE,
      ADD COLUMN IF NOT EXISTS gender VARCHAR(32),
      ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS notification_email_opt_in BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS notification_sms_opt_in BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS notification_push_opt_in BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS marketing_push_opt_in BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS gdpr_erased_at TIMESTAMPTZ
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customer_saved_baskets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        name VARCHAR(120) NOT NULL DEFAULT 'Saved basket',
        items JSONB NOT NULL DEFAULT '[]',
        item_count INT NOT NULL DEFAULT 0,
        subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
        currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_customer_saved_baskets_customer
      ON customer_saved_baskets (tenant_id, customer_id)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customer_saved_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        product_id UUID NOT NULL,
        variant_id UUID,
        quantity INT NOT NULL DEFAULT 1,
        label VARCHAR(255),
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_customer_saved_items_customer
      ON customer_saved_items (tenant_id, customer_id)
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_saved_items_unique_item
      ON customer_saved_items (tenant_id, customer_id, product_id, COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid))
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customer_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        device_label VARCHAR(120) NOT NULL DEFAULT 'Customer app',
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_customer_sessions_customer
      ON customer_sessions (tenant_id, customer_id)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customer_security_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        type VARCHAR(32) NOT NULL,
        token_hash VARCHAR(128) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        consumed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_customer_security_tokens_customer
      ON customer_security_tokens (tenant_id, customer_id, type)
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_security_tokens_hash
      ON customer_security_tokens (tenant_id, token_hash)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customer_security_tokens_hash`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customer_security_tokens_customer`);
    await queryRunner.query(`DROP TABLE IF EXISTS customer_security_tokens`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customer_sessions_customer`);
    await queryRunner.query(`DROP TABLE IF EXISTS customer_sessions`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customer_saved_items_unique_item`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customer_saved_items_customer`);
    await queryRunner.query(`DROP TABLE IF EXISTS customer_saved_items`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customer_saved_baskets_customer`);
    await queryRunner.query(`DROP TABLE IF EXISTS customer_saved_baskets`);
    await queryRunner.query(`
      ALTER TABLE customers
      DROP COLUMN IF EXISTS gdpr_erased_at,
      DROP COLUMN IF EXISTS marketing_push_opt_in,
      DROP COLUMN IF EXISTS notification_push_opt_in,
      DROP COLUMN IF EXISTS notification_sms_opt_in,
      DROP COLUMN IF EXISTS notification_email_opt_in,
      DROP COLUMN IF EXISTS preferences,
      DROP COLUMN IF EXISTS gender,
      DROP COLUMN IF EXISTS date_of_birth,
      DROP COLUMN IF EXISTS email_verified_at
    `);
  }
}
