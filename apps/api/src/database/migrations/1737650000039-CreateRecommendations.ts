import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecommendations1737650000039 implements MigrationInterface {
  name = 'CreateRecommendations1737650000039';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS recommendation_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        customer_id UUID NULL REFERENCES customers(id) ON DELETE SET NULL,
        item_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        event_type VARCHAR(32) NOT NULL,
        source VARCHAR(64),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_recommendation_events_item_type ON recommendation_events (tenant_id, item_id, event_type);
      CREATE INDEX IF NOT EXISTS idx_recommendation_events_customer_created ON recommendation_events (tenant_id, customer_id, created_at);

      CREATE TABLE IF NOT EXISTS recommendation_cache (
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        item_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        recommendations UUID[] NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (tenant_id, item_id)
      );

      CREATE TABLE IF NOT EXISTS recommendation_settings (
        tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
        is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        personalization_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        cart_upsells_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        max_recommendations INT NOT NULL DEFAULT 4,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS recommendation_settings;
      DROP TABLE IF EXISTS recommendation_cache;
      DROP INDEX IF EXISTS idx_recommendation_events_customer_created;
      DROP INDEX IF EXISTS idx_recommendation_events_item_type;
      DROP TABLE IF EXISTS recommendation_events;
    `);
  }
}
