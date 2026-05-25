import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGiftCardsAndStoreCredit1737650000029 implements MigrationInterface {
  name = 'CreateGiftCardsAndStoreCredit1737650000029';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS store_credit_balance NUMERIC(12, 2) NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS gift_cards (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        code VARCHAR(64) NOT NULL,
        initial_value NUMERIC(12, 2) NOT NULL,
        balance NUMERIC(12, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
        customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        expires_at TIMESTAMPTZ,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_gift_cards_tenant_code
      ON gift_cards (tenant_id, code)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_gift_cards_tenant_customer
      ON gift_cards (tenant_id, customer_id)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS gift_card_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
        amount NUMERIC(12, 2) NOT NULL,
        type VARCHAR(32) NOT NULL,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_gift_card_transactions_card
      ON gift_card_transactions (gift_card_id, created_at)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS store_credit_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        amount NUMERIC(12, 2) NOT NULL,
        type VARCHAR(32) NOT NULL,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_store_credit_transactions_customer
      ON store_credit_transactions (tenant_id, customer_id, created_at)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_store_credit_transactions_customer`);
    await queryRunner.query(`DROP TABLE IF EXISTS store_credit_transactions`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_gift_card_transactions_card`);
    await queryRunner.query(`DROP TABLE IF EXISTS gift_card_transactions`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_gift_cards_tenant_customer`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_gift_cards_tenant_code`);
    await queryRunner.query(`DROP TABLE IF EXISTS gift_cards`);
    await queryRunner.query(`ALTER TABLE customers DROP COLUMN IF EXISTS store_credit_balance`);
  }
}
