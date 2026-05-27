import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnterpriseDataLake1737650000081 implements MigrationInterface {
  name = 'CreateEnterpriseDataLake1737650000081';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS data_lake_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        storage_format VARCHAR(32) NOT NULL DEFAULT 'parquet',
        compression VARCHAR(32) NOT NULL DEFAULT 'snappy',
        columnar_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        partition_granularity VARCHAR(16) NOT NULL DEFAULT 'daily',
        pii_masking_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        default_retention_days INT NOT NULL DEFAULT 365,
        metadata JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id)
      );

      CREATE TABLE IF NOT EXISTS data_lake_zones (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        zone_key VARCHAR(32) NOT NULL,
        display_name VARCHAR(180) NOT NULL,
        description TEXT,
        retention_days INT NOT NULL DEFAULT 90,
        immutable BOOLEAN NOT NULL DEFAULT FALSE,
        object_count BIGINT NOT NULL DEFAULT 0,
        bytes_estimate BIGINT NOT NULL DEFAULT 0,
        last_ingested_at TIMESTAMPTZ,
        metadata JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, zone_key)
      );

      CREATE TABLE IF NOT EXISTS data_pipelines (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        pipeline_key VARCHAR(64) NOT NULL,
        display_name VARCHAR(180) NOT NULL,
        pipeline_type VARCHAR(32) NOT NULL,
        source_zone VARCHAR(32),
        target_zone VARCHAR(32),
        schedule_cron VARCHAR(64),
        status VARCHAR(32) NOT NULL DEFAULT 'idle',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        last_run_at TIMESTAMPTZ,
        last_success_at TIMESTAMPTZ,
        config JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, pipeline_key)
      );

      CREATE TABLE IF NOT EXISTS data_pipeline_runs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        pipeline_id UUID NOT NULL REFERENCES data_pipelines(id) ON DELETE CASCADE,
        status VARCHAR(32) NOT NULL,
        run_mode VARCHAR(32) NOT NULL DEFAULT 'incremental',
        partition_date DATE,
        records_in BIGINT NOT NULL DEFAULT 0,
        records_out BIGINT NOT NULL DEFAULT 0,
        records_deduped BIGINT NOT NULL DEFAULT 0,
        records_rejected BIGINT NOT NULL DEFAULT 0,
        error_message TEXT,
        errors JSONB NOT NULL DEFAULT '[]',
        started_at TIMESTAMPTZ NOT NULL,
        finished_at TIMESTAMPTZ,
        metrics JSONB NOT NULL DEFAULT '{}'
      );
      CREATE INDEX IF NOT EXISTS idx_data_pipeline_runs_tenant ON data_pipeline_runs (tenant_id, pipeline_id, started_at DESC);

      CREATE TABLE IF NOT EXISTS data_lake_schemas (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        entity_type VARCHAR(64) NOT NULL,
        version INT NOT NULL DEFAULT 1,
        schema_json JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, entity_type, version)
      );

      CREATE TABLE IF NOT EXISTS data_lake_partitions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        zone_key VARCHAR(32) NOT NULL,
        entity_type VARCHAR(64) NOT NULL,
        partition_date DATE NOT NULL,
        record_count BIGINT NOT NULL DEFAULT 0,
        bytes_estimate BIGINT NOT NULL DEFAULT 0,
        compression VARCHAR(32) NOT NULL DEFAULT 'snappy',
        storage_uri VARCHAR(512),
        last_refreshed_at TIMESTAMPTZ,
        metadata JSONB NOT NULL DEFAULT '{}',
        UNIQUE (tenant_id, zone_key, partition_date, entity_type)
      );

      CREATE TABLE IF NOT EXISTS data_warehouse_tables (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        table_key VARCHAR(64) NOT NULL,
        display_name VARCHAR(180) NOT NULL,
        table_kind VARCHAR(32) NOT NULL,
        grain VARCHAR(128),
        row_count BIGINT NOT NULL DEFAULT 0,
        last_refreshed_at TIMESTAMPTZ,
        is_materialized BOOLEAN NOT NULL DEFAULT FALSE,
        columns JSONB NOT NULL DEFAULT '{}',
        metadata JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, table_key)
      );

      CREATE TABLE IF NOT EXISTS data_materialized_views (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        view_key VARCHAR(64) NOT NULL,
        display_name VARCHAR(180) NOT NULL,
        kpi_category VARCHAR(64) NOT NULL,
        definition_sql TEXT NOT NULL,
        refresh_cron VARCHAR(64),
        last_refreshed_at TIMESTAMPTZ,
        row_count BIGINT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        metadata JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, view_key)
      );

      CREATE TABLE IF NOT EXISTS feature_store_features (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        entity_type VARCHAR(32) NOT NULL,
        entity_id UUID NOT NULL,
        feature_key VARCHAR(64) NOT NULL,
        feature_value JSONB NOT NULL DEFAULT '{}',
        numeric_value DECIMAL(18,6),
        computed_at TIMESTAMPTZ NOT NULL,
        valid_until TIMESTAMPTZ,
        metadata JSONB NOT NULL DEFAULT '{}',
        UNIQUE (tenant_id, entity_type, entity_id, feature_key)
      );

      CREATE TABLE IF NOT EXISTS data_governance_policies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        policy_key VARCHAR(64) NOT NULL,
        display_name VARCHAR(180) NOT NULL,
        retention_days INT,
        pii_fields TEXT[] NOT NULL DEFAULT '{}',
        masking_strategy VARCHAR(32) NOT NULL DEFAULT 'hash',
        gdpr_export_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        audit_data_access BOOLEAN NOT NULL DEFAULT TRUE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        metadata JSONB NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, policy_key)
      );

      CREATE TABLE IF NOT EXISTS data_lake_exports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        target VARCHAR(32) NOT NULL,
        entity_type VARCHAR(64) NOT NULL,
        zone_key VARCHAR(32) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        row_count BIGINT NOT NULL DEFAULT 0,
        export_uri VARCHAR(512),
        pii_masked BOOLEAN NOT NULL DEFAULT TRUE,
        requested_by UUID,
        error_message TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        finished_at TIMESTAMPTZ,
        metadata JSONB NOT NULL DEFAULT '{}'
      );
      CREATE INDEX IF NOT EXISTS idx_data_lake_exports_tenant ON data_lake_exports (tenant_id, created_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS data_lake_exports;
      DROP TABLE IF EXISTS data_governance_policies;
      DROP TABLE IF EXISTS feature_store_features;
      DROP TABLE IF EXISTS data_materialized_views;
      DROP TABLE IF EXISTS data_warehouse_tables;
      DROP TABLE IF EXISTS data_lake_partitions;
      DROP TABLE IF EXISTS data_lake_schemas;
      DROP TABLE IF EXISTS data_pipeline_runs;
      DROP TABLE IF EXISTS data_pipelines;
      DROP TABLE IF EXISTS data_lake_zones;
      DROP TABLE IF EXISTS data_lake_settings;
    `);
  }
}
