import { MigrationInterface, QueryRunner } from 'typeorm';

export class MarketingAutomationEngine1737650000068 implements MigrationInterface {
  name = 'MarketingAutomationEngine1737650000068';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE marketing_segments
      ADD COLUMN IF NOT EXISTS builder_type VARCHAR(32) NOT NULL DEFAULT 'custom',
      ADD COLUMN IF NOT EXISTS rule_summary JSONB NOT NULL DEFAULT '[]'
    `);

    await queryRunner.query(`
      ALTER TABLE marketing_campaigns
      ADD COLUMN IF NOT EXISTS campaign_type VARCHAR(32) NOT NULL DEFAULT 'broadcast',
      ADD COLUMN IF NOT EXISTS channels TEXT[] NOT NULL DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS schedule_type VARCHAR(32) NOT NULL DEFAULT 'one-time',
      ADD COLUMN IF NOT EXISTS recurrence_rule VARCHAR(120),
      ADD COLUMN IF NOT EXISTS frequency_cap INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS campaign_category VARCHAR(64),
      ADD COLUMN IF NOT EXISTS safety_rules JSONB NOT NULL DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'
    `);
    await queryRunner.query(`
      UPDATE marketing_campaigns
      SET channels = ARRAY[type]
      WHERE channels = '{}'
    `);

    await queryRunner.query(`
      ALTER TABLE marketing_campaign_logs
      ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS revenue_attributed DECIMAL(12, 2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS marketing_journeys (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        trigger VARCHAR(64) NOT NULL,
        target_segment_id UUID REFERENCES marketing_segments(id) ON DELETE SET NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'draft',
        channels TEXT[] NOT NULL DEFAULT '{}',
        frequency_cap INTEGER NOT NULL DEFAULT 1,
        steps JSONB NOT NULL DEFAULT '[]',
        safety_rules JSONB NOT NULL DEFAULT '{}',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_marketing_journeys_tenant_status
      ON marketing_journeys (tenant_id, status)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS marketing_behavior_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        event_type VARCHAR(64) NOT NULL,
        source VARCHAR(64) NOT NULL DEFAULT 'marketing',
        campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
        journey_id UUID REFERENCES marketing_journeys(id) ON DELETE SET NULL,
        occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        properties JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_marketing_behavior_events_customer
      ON marketing_behavior_events (tenant_id, customer_id, event_type)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_marketing_behavior_events_type_time
      ON marketing_behavior_events (tenant_id, event_type, occurred_at)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_marketing_behavior_events_type_time`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_marketing_behavior_events_customer`);
    await queryRunner.query(`DROP TABLE IF EXISTS marketing_behavior_events`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_marketing_journeys_tenant_status`);
    await queryRunner.query(`DROP TABLE IF EXISTS marketing_journeys`);
    await queryRunner.query(`
      ALTER TABLE marketing_campaign_logs
      DROP COLUMN IF EXISTS metadata,
      DROP COLUMN IF EXISTS unsubscribed_at,
      DROP COLUMN IF EXISTS revenue_attributed,
      DROP COLUMN IF EXISTS converted_at,
      DROP COLUMN IF EXISTS clicked_at,
      DROP COLUMN IF EXISTS opened_at
    `);
    await queryRunner.query(`
      ALTER TABLE marketing_campaigns
      DROP COLUMN IF EXISTS metadata,
      DROP COLUMN IF EXISTS safety_rules,
      DROP COLUMN IF EXISTS campaign_category,
      DROP COLUMN IF EXISTS frequency_cap,
      DROP COLUMN IF EXISTS recurrence_rule,
      DROP COLUMN IF EXISTS schedule_type,
      DROP COLUMN IF EXISTS channels,
      DROP COLUMN IF EXISTS campaign_type
    `);
    await queryRunner.query(`
      ALTER TABLE marketing_segments
      DROP COLUMN IF EXISTS rule_summary,
      DROP COLUMN IF EXISTS builder_type
    `);
  }
}
