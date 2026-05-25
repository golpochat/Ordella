import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSearchIndex1737650000045 implements MigrationInterface {
  name = 'CreateSearchIndex1737650000045';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS search_index (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        entity_type VARCHAR(64) NOT NULL,
        entity_id UUID NOT NULL,
        title VARCHAR(512) NOT NULL,
        body TEXT NULL,
        keywords TEXT[] NOT NULL DEFAULT '{}',
        metadata JSONB NOT NULL DEFAULT '{}',
        embedding JSONB NOT NULL DEFAULT '[]',
        source_updated_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NULL,
        search_vector TSVECTOR GENERATED ALWAYS AS (
          setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
          setweight(to_tsvector('simple', coalesce(body, '')), 'B') ||
          setweight(to_tsvector('simple', array_to_string(keywords, ' ')), 'C')
        ) STORED
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_search_index_tenant_entity
        ON search_index(tenant_id, entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_search_index_tenant_type
        ON search_index(tenant_id, entity_type);
      CREATE INDEX IF NOT EXISTS idx_search_index_tenant_updated
        ON search_index(tenant_id, updated_at);
      CREATE INDEX IF NOT EXISTS idx_search_index_keywords
        ON search_index USING GIN(keywords);
      CREATE INDEX IF NOT EXISTS idx_search_index_metadata
        ON search_index USING GIN(metadata);
      CREATE INDEX IF NOT EXISTS idx_search_index_vector
        ON search_index USING GIN(search_vector);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_search_index_vector;
      DROP INDEX IF EXISTS idx_search_index_metadata;
      DROP INDEX IF EXISTS idx_search_index_keywords;
      DROP INDEX IF EXISTS idx_search_index_tenant_updated;
      DROP INDEX IF EXISTS idx_search_index_tenant_type;
      DROP INDEX IF EXISTS idx_search_index_tenant_entity;
      DROP TABLE IF EXISTS search_index;
    `);
  }
}
