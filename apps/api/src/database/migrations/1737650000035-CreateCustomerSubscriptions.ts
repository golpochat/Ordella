import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerSubscriptions1737650000035 implements MigrationInterface {
  name = 'CreateCustomerSubscriptions1737650000035';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customer_subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        location_id UUID NOT NULL,
        order_type VARCHAR(32) NOT NULL DEFAULT 'pickup',
        schedule VARCHAR(32) NOT NULL,
        next_run_at TIMESTAMPTZ NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        total_price DECIMAL(12, 2) NOT NULL,
        payment_method_id VARCHAR(255),
        delivery_details JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_tenant_customer ON customer_subscriptions (tenant_id, customer_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_due ON customer_subscriptions (tenant_id, status, next_run_at)`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customer_subscription_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        subscription_id UUID NOT NULL REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
        item_id UUID NOT NULL,
        variant_id UUID,
        quantity INT NOT NULL,
        modifiers JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customer_subscription_items_subscription ON customer_subscription_items (subscription_id)`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customer_subscription_orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        subscription_id UUID NOT NULL REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        run_at TIMESTAMPTZ NOT NULL,
        status VARCHAR(16) NOT NULL,
        retry_count INT NOT NULL DEFAULT 0,
        failure_reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_customer_subscription_orders_subscription_run ON customer_subscription_orders (subscription_id, run_at)`);
    await queryRunner.query(`
      INSERT INTO permissions (key, description)
      VALUES
        ('subscriptions.read', 'Read recurring order subscriptions'),
        ('subscriptions.write', 'Create and manage recurring order subscriptions')
      ON CONFLICT (key) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customer_subscription_orders_subscription_run`);
    await queryRunner.query(`DROP TABLE IF EXISTS customer_subscription_orders`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customer_subscription_items_subscription`);
    await queryRunner.query(`DROP TABLE IF EXISTS customer_subscription_items`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customer_subscriptions_due`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customer_subscriptions_tenant_customer`);
    await queryRunner.query(`DROP TABLE IF EXISTS customer_subscriptions`);
  }
}
