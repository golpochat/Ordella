import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMarketingAutomation1737650000033 implements MigrationInterface {
  name = 'CreateMarketingAutomation1737650000033';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE customers
      ADD COLUMN IF NOT EXISTS marketing_email_opt_in BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS marketing_sms_opt_in BOOLEAN NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS marketing_segments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        filters JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_marketing_segments_tenant_name ON marketing_segments (tenant_id, name)`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS marketing_campaigns (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(16) NOT NULL,
        segment_id UUID NOT NULL REFERENCES marketing_segments(id) ON DELETE RESTRICT,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        schedule_at TIMESTAMPTZ,
        status VARCHAR(32) NOT NULL DEFAULT 'draft',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_tenant_status ON marketing_campaigns (tenant_id, status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_tenant_schedule ON marketing_campaigns (tenant_id, schedule_at)`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS marketing_campaign_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        channel VARCHAR(16) NOT NULL,
        status VARCHAR(16) NOT NULL,
        sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_marketing_campaign_logs_campaign_customer ON marketing_campaign_logs (campaign_id, customer_id)`);
    await queryRunner.query(`
      INSERT INTO permissions (key, description)
      VALUES
        ('marketing.read', 'Read marketing segments and campaigns'),
        ('marketing.write', 'Create and send marketing campaigns')
      ON CONFLICT (key) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_marketing_campaign_logs_campaign_customer`);
    await queryRunner.query(`DROP TABLE IF EXISTS marketing_campaign_logs`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_marketing_campaigns_tenant_schedule`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_marketing_campaigns_tenant_status`);
    await queryRunner.query(`DROP TABLE IF EXISTS marketing_campaigns`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_marketing_segments_tenant_name`);
    await queryRunner.query(`DROP TABLE IF EXISTS marketing_segments`);
    await queryRunner.query(`
      ALTER TABLE customers
      DROP COLUMN IF EXISTS marketing_sms_opt_in,
      DROP COLUMN IF EXISTS marketing_email_opt_in
    `);
  }
}
