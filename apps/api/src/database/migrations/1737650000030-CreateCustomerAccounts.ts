import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerAccounts1737650000030 implements MigrationInterface {
  name = 'CreateCustomerAccounts1737650000030';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS default_address_id UUID,
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customer_addresses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        label VARCHAR(64) NOT NULL DEFAULT 'Home',
        line_1 VARCHAR(255) NOT NULL,
        line_2 VARCHAR(255),
        city VARCHAR(120) NOT NULL,
        postcode VARCHAR(32),
        country VARCHAR(120) NOT NULL DEFAULT 'GB',
        instructions VARCHAR(512),
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_default
      ON customer_addresses (customer_id, is_default)
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_addresses_one_default
      ON customer_addresses (customer_id)
      WHERE is_default = true
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'fk_customers_default_address'
        ) THEN
          ALTER TABLE customers
          ADD CONSTRAINT fk_customers_default_address
          FOREIGN KEY (default_address_id)
          REFERENCES customer_addresses(id)
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE customers DROP CONSTRAINT IF EXISTS fk_customers_default_address`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customer_addresses_one_default`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customer_addresses_customer_default`);
    await queryRunner.query(`DROP TABLE IF EXISTS customer_addresses`);
    await queryRunner.query(`
      ALTER TABLE customers
      DROP COLUMN IF EXISTS last_login_at,
      DROP COLUMN IF EXISTS default_address_id,
      DROP COLUMN IF EXISTS password_hash
    `);
  }
}
