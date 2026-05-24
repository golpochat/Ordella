import { MigrationInterface, QueryRunner } from 'typeorm';

/** ERD §1.8 + SRS §12 / §47 — promotions, promotion_rules, promotion_conditions, promotion_applications */
export class CreatePromotionsSchema1737650000011 implements MigrationInterface {
  name = 'CreatePromotionsSchema1737650000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS promotions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(128) NOT NULL,
        type VARCHAR(32) NOT NULL,
        value DECIMAL(12, 2) NOT NULL,
        start_date TIMESTAMPTZ,
        end_date TIMESTAMPTZ,
        status VARCHAR(32) NOT NULL DEFAULT 'draft',
        code VARCHAR(64),
        usage_limit INT,
        usage_count INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_promotions_tenant_status ON promotions (tenant_id, status);
      CREATE INDEX IF NOT EXISTS idx_promotions_tenant_dates ON promotions (tenant_id, start_date, end_date);

      CREATE TABLE IF NOT EXISTS promotion_rules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
        rule_type VARCHAR(32) NOT NULL,
        priority INT NOT NULL DEFAULT 0,
        config JSONB NOT NULL DEFAULT '{}',
        is_stackable BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_promotion_rules_promotion_priority ON promotion_rules (promotion_id, priority);

      CREATE TABLE IF NOT EXISTS promotion_conditions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
        condition_type VARCHAR(32) NOT NULL,
        operator VARCHAR(16) NOT NULL DEFAULT 'eq',
        value JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_promotion_conditions_promotion_type ON promotion_conditions (promotion_id, condition_type);

      CREATE TABLE IF NOT EXISTS promotion_applications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        customer_id UUID,
        discount_amount DECIMAL(12, 2) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'applied',
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_promotion_applications_promotion_created ON promotion_applications (promotion_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_promotion_applications_order_id ON promotion_applications (order_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS promotion_applications;
      DROP TABLE IF EXISTS promotion_conditions;
      DROP TABLE IF EXISTS promotion_rules;
      DROP TABLE IF EXISTS promotions;
    `);
  }
}
