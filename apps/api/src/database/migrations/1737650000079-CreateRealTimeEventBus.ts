import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRealTimeEventBus1737650000079 implements MigrationInterface {
  name = 'CreateRealTimeEventBus1737650000079';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS event_topics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        topic_key VARCHAR(64) NOT NULL,
        display_name VARCHAR(180) NOT NULL,
        description TEXT,
        partition_count INT NOT NULL DEFAULT 8,
        retention_days INT NOT NULL DEFAULT 30,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        permissions JSONB NOT NULL DEFAULT '[]',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, topic_key)
      );

      CREATE TABLE IF NOT EXISTS event_schemas (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        topic_key VARCHAR(64) NOT NULL,
        version INT NOT NULL DEFAULT 1,
        event_type VARCHAR(128) NOT NULL,
        schema_json JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, topic_key, version)
      );

      CREATE TABLE IF NOT EXISTS event_store_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        event_id VARCHAR(160) NOT NULL,
        topic_key VARCHAR(64) NOT NULL,
        partition_key VARCHAR(128) NOT NULL,
        sequence_number BIGINT NOT NULL,
        event_type VARCHAR(128) NOT NULL,
        schema_version INT NOT NULL DEFAULT 1,
        producer VARCHAR(32) NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}',
        metadata JSONB NOT NULL DEFAULT '{}',
        location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
        occurred_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, event_id)
      );

      CREATE TABLE IF NOT EXISTS event_subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        topic_key VARCHAR(64) NOT NULL,
        consumer_group VARCHAR(128) NOT NULL,
        consumer_type VARCHAR(64) NOT NULL,
        filter_rules JSONB NOT NULL DEFAULT '{}',
        delivery_semantics VARCHAR(32) NOT NULL DEFAULT 'at_least_once',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        max_retries INT NOT NULL DEFAULT 5,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, topic_key, consumer_group)
      );

      CREATE TABLE IF NOT EXISTS event_consumer_offsets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        subscription_id UUID NOT NULL REFERENCES event_subscriptions(id) ON DELETE CASCADE,
        last_sequence BIGINT NOT NULL DEFAULT 0,
        lag_count INT NOT NULL DEFAULT 0,
        processed_count INT NOT NULL DEFAULT 0,
        last_processed_at TIMESTAMPTZ,
        idempotency_keys JSONB NOT NULL DEFAULT '[]',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, subscription_id)
      );

      CREATE TABLE IF NOT EXISTS event_dead_letters (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        subscription_id UUID NOT NULL REFERENCES event_subscriptions(id) ON DELETE CASCADE,
        event_id VARCHAR(160) NOT NULL,
        store_record_id UUID NOT NULL REFERENCES event_store_records(id) ON DELETE CASCADE,
        status VARCHAR(24) NOT NULL DEFAULT 'open',
        attempts INT NOT NULL DEFAULT 0,
        error_message TEXT NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS event_stream_metrics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        topic_key VARCHAR(64) NOT NULL,
        window_start TIMESTAMPTZ NOT NULL,
        window_end TIMESTAMPTZ NOT NULL,
        event_count INT NOT NULL DEFAULT 0,
        bytes_estimate INT NOT NULL DEFAULT 0,
        anomaly_score DECIMAL(6,4),
        aggregates JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_event_store_topic_sequence ON event_store_records (tenant_id, topic_key, sequence_number)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_event_store_partition ON event_store_records (tenant_id, topic_key, partition_key, sequence_number)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_event_subscriptions_topic ON event_subscriptions (tenant_id, topic_key, is_active)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_event_dead_letters_status ON event_dead_letters (tenant_id, status, created_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_event_stream_metrics_window ON event_stream_metrics (tenant_id, topic_key, window_start)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_event_stream_metrics_window`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_event_dead_letters_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_event_subscriptions_topic`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_event_store_partition`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_event_store_topic_sequence`);
    await queryRunner.query(`DROP TABLE IF EXISTS event_stream_metrics`);
    await queryRunner.query(`DROP TABLE IF EXISTS event_dead_letters`);
    await queryRunner.query(`DROP TABLE IF EXISTS event_consumer_offsets`);
    await queryRunner.query(`DROP TABLE IF EXISTS event_subscriptions`);
    await queryRunner.query(`DROP TABLE IF EXISTS event_store_records`);
    await queryRunner.query(`DROP TABLE IF EXISTS event_schemas`);
    await queryRunner.query(`DROP TABLE IF EXISTS event_topics`);
  }
}
