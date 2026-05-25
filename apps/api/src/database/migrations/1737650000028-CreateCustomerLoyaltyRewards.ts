import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerLoyaltyRewards1737650000028 implements MigrationInterface {
  name = 'CreateCustomerLoyaltyRewards1737650000028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(32),
        points_balance INTEGER NOT NULL DEFAULT 0,
        lifetime_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
        last_order_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customers_tenant_email ON customers (tenant_id, email)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customers_tenant_phone ON customers (tenant_id, phone)`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS loyalty_settings (
        tenant_id UUID PRIMARY KEY,
        is_enabled BOOLEAN NOT NULL DEFAULT true,
        earn_rate NUMERIC(10, 4) NOT NULL DEFAULT 1,
        redeem_rate NUMERIC(10, 4) NOT NULL DEFAULT 0.01,
        auto_enroll BOOLEAN NOT NULL DEFAULT true,
        min_redeem_points INTEGER NOT NULL DEFAULT 100,
        max_redeem_percent INTEGER NOT NULL DEFAULT 50
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS loyalty_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        points INTEGER NOT NULL,
        type VARCHAR(32) NOT NULL,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer ON loyalty_transactions (tenant_id, customer_id, created_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions (tenant_id, type)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_loyalty_transactions_type`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_loyalty_transactions_customer`);
    await queryRunner.query(`DROP TABLE IF EXISTS loyalty_transactions`);
    await queryRunner.query(`DROP TABLE IF EXISTS loyalty_settings`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customers_tenant_phone`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customers_tenant_email`);
    await queryRunner.query(`DROP TABLE IF EXISTS customers`);
  }
}
