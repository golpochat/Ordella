import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceSearchRecommendations1737650000060 implements MigrationInterface {
  name = 'EnhanceSearchRecommendations1737650000060';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS search_analytics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        event_type VARCHAR(32) NOT NULL,
        query VARCHAR(255) NULL,
        entity_type VARCHAR(64) NULL,
        entity_id UUID NULL,
        result_count INT NOT NULL DEFAULT 0,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_search_analytics_tenant_event_created ON search_analytics(tenant_id, event_type, created_at);
      CREATE INDEX IF NOT EXISTS idx_search_analytics_tenant_query ON search_analytics(tenant_id, query);

      ALTER TABLE recommendation_settings
        ADD COLUMN IF NOT EXISTS enabled_types JSONB NOT NULL DEFAULT '["trending","frequently_bought_together","recently_viewed","similar_products","category_based"]',
        ADD COLUMN IF NOT EXISTS ranking_weights JSONB NOT NULL DEFAULT '{"trending":1,"frequentlyBoughtTogether":1,"recentlyViewed":1,"similarProducts":1,"categoryBased":1,"availability":1}',
        ADD COLUMN IF NOT EXISTS personalization_rules JSONB NOT NULL DEFAULT '{}';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE recommendation_settings
        DROP COLUMN IF EXISTS personalization_rules,
        DROP COLUMN IF EXISTS ranking_weights,
        DROP COLUMN IF EXISTS enabled_types;
      DROP INDEX IF EXISTS idx_search_analytics_tenant_query;
      DROP INDEX IF EXISTS idx_search_analytics_tenant_event_created;
      DROP TABLE IF EXISTS search_analytics;
    `);
  }
}
