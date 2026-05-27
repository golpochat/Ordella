import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRetailGenome1737650000088 implements MigrationInterface {
  name = 'CreateRetailGenome1737650000088';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS genome_graph_schemas (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        schema_key VARCHAR(96) NOT NULL,
        version INT NOT NULL DEFAULT 1,
        entity_types JSONB NOT NULL DEFAULT '[]'::jsonb,
        relationship_types JSONB NOT NULL DEFAULT '[]'::jsonb,
        status VARCHAR(32) NOT NULL DEFAULT 'published',
        published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        UNIQUE (tenant_id, schema_key, version)
      );

      CREATE TABLE IF NOT EXISTS genome_entities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        entity_type VARCHAR(64) NOT NULL,
        external_ref VARCHAR(128) NOT NULL,
        display_name VARCHAR(255) NOT NULL DEFAULT '',
        canonical_id UUID,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, entity_type, external_ref)
      );
      CREATE INDEX IF NOT EXISTS idx_genome_entities_type ON genome_entities (tenant_id, entity_type);

      CREATE TABLE IF NOT EXISTS genome_relationships (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        source_entity_id UUID NOT NULL REFERENCES genome_entities(id) ON DELETE CASCADE,
        target_entity_id UUID NOT NULL REFERENCES genome_entities(id) ON DELETE CASCADE,
        relationship_type VARCHAR(64) NOT NULL,
        score DECIMAL(8,4) NOT NULL DEFAULT 1,
        inferred BOOLEAN NOT NULL DEFAULT FALSE,
        explainability JSONB NOT NULL DEFAULT '{}'::jsonb,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, source_entity_id, target_entity_id, relationship_type)
      );
      CREATE INDEX IF NOT EXISTS idx_genome_relationships_type ON genome_relationships (tenant_id, relationship_type);

      CREATE TABLE IF NOT EXISTS genome_attributes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        entity_id UUID NOT NULL REFERENCES genome_entities(id) ON DELETE CASCADE,
        attribute_key VARCHAR(96) NOT NULL,
        attribute_value JSONB NOT NULL DEFAULT '{}'::jsonb,
        source VARCHAR(64) NOT NULL DEFAULT 'ingestion',
        enriched BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, entity_id, attribute_key)
      );

      CREATE TABLE IF NOT EXISTS genome_embeddings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        entity_id UUID NOT NULL REFERENCES genome_entities(id) ON DELETE CASCADE,
        model_key VARCHAR(64) NOT NULL DEFAULT 'text-embedding-v1',
        dimensions INT NOT NULL DEFAULT 384,
        vector JSONB NOT NULL DEFAULT '[]'::jsonb,
        refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, entity_id, model_key)
      );

      CREATE TABLE IF NOT EXISTS genome_ingestion_runs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        pipeline_key VARCHAR(96) NOT NULL,
        source VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        records_in INT NOT NULL DEFAULT 0,
        records_out INT NOT NULL DEFAULT 0,
        entities_merged INT NOT NULL DEFAULT 0,
        relationships_inferred INT NOT NULL DEFAULT 0,
        errors JSONB NOT NULL DEFAULT '[]'::jsonb,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        finished_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_genome_ingestion ON genome_ingestion_runs (tenant_id, started_at DESC);

      CREATE TABLE IF NOT EXISTS genome_query_cache (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        cache_key VARCHAR(255) NOT NULL,
        query_type VARCHAR(64) NOT NULL,
        result JSONB NOT NULL DEFAULT '{}'::jsonb,
        hit_count INT NOT NULL DEFAULT 0,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, cache_key)
      );

      CREATE TABLE IF NOT EXISTS genome_reasoning_artifacts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        reasoning_type VARCHAR(64) NOT NULL,
        subject_entity_id UUID REFERENCES genome_entities(id) ON DELETE SET NULL,
        conclusion JSONB NOT NULL DEFAULT '{}'::jsonb,
        confidence DECIMAL(5,4) NOT NULL DEFAULT 0.8,
        explainability JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_genome_reasoning ON genome_reasoning_artifacts (tenant_id, reasoning_type);

      CREATE TABLE IF NOT EXISTS genome_federated_rounds (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        round_key VARCHAR(96) NOT NULL,
        model_key VARCHAR(96) NOT NULL,
        privacy_budget DECIMAL(8,4) NOT NULL DEFAULT 1.0,
        epsilon DECIMAL(8,4) NOT NULL DEFAULT 0.1,
        gradient_hash VARCHAR(128) NOT NULL DEFAULT '',
        status VARCHAR(32) NOT NULL DEFAULT 'completed',
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, round_key)
      );

      CREATE TABLE IF NOT EXISTS genome_global_patterns (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        pattern_key VARCHAR(96) NOT NULL,
        pattern_type VARCHAR(64) NOT NULL,
        anonymized_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        contributor_count INT NOT NULL DEFAULT 0,
        differential_privacy_applied BOOLEAN NOT NULL DEFAULT TRUE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (pattern_key)
      );

      CREATE TABLE IF NOT EXISTS genome_lineage_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        source VARCHAR(64) NOT NULL,
        target_entity_id UUID,
        action VARCHAR(128) NOT NULL,
        lineage JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_genome_lineage ON genome_lineage_events (tenant_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS genome_graph_snapshots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        snapshot_key VARCHAR(96) NOT NULL,
        entity_count INT NOT NULL DEFAULT 0,
        relationship_count INT NOT NULL DEFAULT 0,
        checksum VARCHAR(64) NOT NULL DEFAULT '',
        state JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, snapshot_key)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS genome_graph_snapshots;
      DROP TABLE IF EXISTS genome_lineage_events;
      DROP TABLE IF EXISTS genome_global_patterns;
      DROP TABLE IF EXISTS genome_federated_rounds;
      DROP TABLE IF EXISTS genome_reasoning_artifacts;
      DROP TABLE IF EXISTS genome_query_cache;
      DROP TABLE IF EXISTS genome_ingestion_runs;
      DROP TABLE IF EXISTS genome_embeddings;
      DROP TABLE IF EXISTS genome_attributes;
      DROP TABLE IF EXISTS genome_relationships;
      DROP TABLE IF EXISTS genome_entities;
      DROP TABLE IF EXISTS genome_graph_schemas;
    `);
  }
}
