import { MigrationInterface, QueryRunner } from 'typeorm';

/** ERD §1.5 + SRS §9 — payments, refunds, payment_methods, payment_attempts */
export class CreatePaymentsSchema1737650000006 implements MigrationInterface {
  name = 'CreatePaymentsSchema1737650000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        customer_id UUID,
        type VARCHAR(32) NOT NULL,
        provider VARCHAR(32) NOT NULL,
        display_label VARCHAR(128),
        last_four VARCHAR(4),
        brand VARCHAR(32),
        provider_token VARCHAR(255),
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_payment_methods_tenant_customer ON payment_methods (tenant_id, customer_id);

      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
        provider VARCHAR(32) NOT NULL,
        method VARCHAR(32) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        provider_payment_id VARCHAR(255),
        payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_payments_tenant_order ON payments (tenant_id, order_id);
      CREATE INDEX IF NOT EXISTS idx_payments_tenant_status ON payments (tenant_id, status);

      CREATE TABLE IF NOT EXISTS payment_attempts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
        attempt_number INT NOT NULL DEFAULT 1,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        provider_response JSONB NOT NULL DEFAULT '{}',
        error_message TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_payment_attempts_payment_created ON payment_attempts (payment_id, created_at);

      CREATE TABLE IF NOT EXISTS refunds (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
        amount DECIMAL(12, 2) NOT NULL,
        reason TEXT,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        provider_refund_id VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds (payment_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS refunds;
      DROP TABLE IF EXISTS payment_attempts;
      DROP TABLE IF EXISTS payments;
      DROP TABLE IF EXISTS payment_methods;
    `);
  }
}
