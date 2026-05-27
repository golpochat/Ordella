import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCloudPlatform1737650000087 implements MigrationInterface {
  name = 'CreateCloudPlatform1737650000087';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cloud_regions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        region_code VARCHAR(64) NOT NULL,
        display_name VARCHAR(180) NOT NULL,
        cloud_provider VARCHAR(32) NOT NULL DEFAULT 'aws',
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, region_code)
      );

      CREATE TABLE IF NOT EXISTS cloud_region_capabilities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        region_id UUID NOT NULL REFERENCES cloud_regions(id) ON DELETE CASCADE,
        data_residency_zones JSONB NOT NULL DEFAULT '[]'::jsonb,
        latency_class VARCHAR(32) NOT NULL DEFAULT 'standard',
        supported_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
        max_tenants INT NOT NULL DEFAULT 0,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, region_id)
      );

      CREATE TABLE IF NOT EXISTS cloud_tenant_region_assignments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        region_id UUID NOT NULL REFERENCES cloud_regions(id) ON DELETE CASCADE,
        assignment_role VARCHAR(32) NOT NULL DEFAULT 'primary',
        workload_types JSONB NOT NULL DEFAULT '[]'::jsonb,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        UNIQUE (tenant_id, region_id, assignment_role)
      );

      CREATE TABLE IF NOT EXISTS cloud_failover_rules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        primary_region_id UUID NOT NULL REFERENCES cloud_regions(id) ON DELETE CASCADE,
        failover_region_id UUID NOT NULL REFERENCES cloud_regions(id) ON DELETE CASCADE,
        mode VARCHAR(32) NOT NULL DEFAULT 'active_passive',
        rpo_seconds INT NOT NULL DEFAULT 300,
        rto_seconds INT NOT NULL DEFAULT 900,
        auto_failover BOOLEAN NOT NULL DEFAULT TRUE,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_cloud_failover_tenant ON cloud_failover_rules (tenant_id);

      CREATE TABLE IF NOT EXISTS cloud_replication_links (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        source_region_id UUID NOT NULL REFERENCES cloud_regions(id) ON DELETE CASCADE,
        target_region_id UUID NOT NULL REFERENCES cloud_regions(id) ON DELETE CASCADE,
        replication_type VARCHAR(32) NOT NULL DEFAULT 'async',
        lag_ms INT NOT NULL DEFAULT 0,
        status VARCHAR(32) NOT NULL DEFAULT 'healthy',
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, source_region_id, target_region_id)
      );

      CREATE TABLE IF NOT EXISTS cloud_edge_nodes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        region_id UUID REFERENCES cloud_regions(id) ON DELETE SET NULL,
        node_key VARCHAR(96) NOT NULL,
        node_type VARCHAR(64) NOT NULL,
        display_name VARCHAR(255) NOT NULL DEFAULT '',
        location_ref VARCHAR(128),
        offline_first BOOLEAN NOT NULL DEFAULT FALSE,
        sync_gateway_uri VARCHAR(512) NOT NULL DEFAULT '',
        status VARCHAR(32) NOT NULL DEFAULT 'online',
        uptime_percent DECIMAL(5,2) NOT NULL DEFAULT 100,
        last_seen_at TIMESTAMPTZ,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, node_key)
      );
      CREATE INDEX IF NOT EXISTS idx_cloud_edge_nodes_type ON cloud_edge_nodes (tenant_id, node_type);

      CREATE TABLE IF NOT EXISTS cloud_routing_policies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        tenant_routing JSONB NOT NULL DEFAULT '{}'::jsonb,
        storefront_geo_routing JSONB NOT NULL DEFAULT '{}'::jsonb,
        pos_low_latency JSONB NOT NULL DEFAULT '{}'::jsonb,
        failover_routing JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id)
      );

      CREATE TABLE IF NOT EXISTS cloud_residency_policies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        eu_only_mode BOOLEAN NOT NULL DEFAULT FALSE,
        us_only_mode BOOLEAN NOT NULL DEFAULT FALSE,
        apac_residency BOOLEAN NOT NULL DEFAULT FALSE,
        allowed_regions JSONB NOT NULL DEFAULT '[]'::jsonb,
        enforce_strict BOOLEAN NOT NULL DEFAULT TRUE,
        custom_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id)
      );

      CREATE TABLE IF NOT EXISTS cloud_deployments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        region_id UUID REFERENCES cloud_regions(id) ON DELETE SET NULL,
        deployment_key VARCHAR(96) NOT NULL,
        deployment_type VARCHAR(64) NOT NULL DEFAULT 'provision',
        strategy VARCHAR(32) NOT NULL DEFAULT 'rolling',
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        version VARCHAR(64) NOT NULL DEFAULT '',
        canary_percent INT NOT NULL DEFAULT 0,
        scaling_config JSONB NOT NULL DEFAULT '{}'::jsonb,
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        rollback_of_id UUID,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, deployment_key)
      );
      CREATE INDEX IF NOT EXISTS idx_cloud_deployments_status ON cloud_deployments (tenant_id, status);

      CREATE TABLE IF NOT EXISTS cloud_region_health_snapshots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        region_id UUID NOT NULL REFERENCES cloud_regions(id) ON DELETE CASCADE,
        health_status VARCHAR(32) NOT NULL DEFAULT 'healthy',
        latency_p50_ms INT NOT NULL DEFAULT 0,
        latency_p99_ms INT NOT NULL DEFAULT 0,
        error_rate_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
        request_count BIGINT NOT NULL DEFAULT 0,
        recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_cloud_health_recorded ON cloud_region_health_snapshots (tenant_id, region_id, recorded_at DESC);

      CREATE TABLE IF NOT EXISTS cloud_monitoring_alerts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        alert_type VARCHAR(64) NOT NULL,
        severity VARCHAR(32) NOT NULL DEFAULT 'medium',
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        region_id UUID REFERENCES cloud_regions(id) ON DELETE SET NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'open',
        source VARCHAR(64) NOT NULL DEFAULT 'platform',
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_cloud_monitoring_alerts ON cloud_monitoring_alerts (tenant_id, status, detected_at DESC);

      CREATE TABLE IF NOT EXISTS cloud_cdn_configs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        storefront_cdn JSONB NOT NULL DEFAULT '{}'::jsonb,
        image_optimization JSONB NOT NULL DEFAULT '{}'::jsonb,
        api_edge_cache JSONB NOT NULL DEFAULT '{}'::jsonb,
        static_asset_replication JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id)
      );

      CREATE TABLE IF NOT EXISTS cloud_encryption_keys (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        region_id UUID NOT NULL REFERENCES cloud_regions(id) ON DELETE CASCADE,
        key_alias VARCHAR(128) NOT NULL,
        provider VARCHAR(32) NOT NULL DEFAULT 'aws_kms',
        rotation_days INT NOT NULL DEFAULT 90,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, region_id, key_alias)
      );

      CREATE TABLE IF NOT EXISTS cloud_cross_region_access_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        source_region_id UUID,
        target_region_id UUID,
        actor_type VARCHAR(64) NOT NULL DEFAULT 'system',
        action VARCHAR(128) NOT NULL,
        resource_type VARCHAR(64) NOT NULL,
        allowed BOOLEAN NOT NULL DEFAULT TRUE,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_cloud_cross_region_logs ON cloud_cross_region_access_logs (tenant_id, created_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS cloud_cross_region_access_logs;
      DROP TABLE IF EXISTS cloud_encryption_keys;
      DROP TABLE IF EXISTS cloud_cdn_configs;
      DROP TABLE IF EXISTS cloud_monitoring_alerts;
      DROP TABLE IF EXISTS cloud_region_health_snapshots;
      DROP TABLE IF EXISTS cloud_deployments;
      DROP TABLE IF EXISTS cloud_residency_policies;
      DROP TABLE IF EXISTS cloud_routing_policies;
      DROP TABLE IF EXISTS cloud_edge_nodes;
      DROP TABLE IF EXISTS cloud_replication_links;
      DROP TABLE IF EXISTS cloud_failover_rules;
      DROP TABLE IF EXISTS cloud_tenant_region_assignments;
      DROP TABLE IF EXISTS cloud_region_capabilities;
      DROP TABLE IF EXISTS cloud_regions;
    `);
  }
}
