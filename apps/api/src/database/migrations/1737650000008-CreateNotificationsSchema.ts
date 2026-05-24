import { MigrationInterface, QueryRunner } from 'typeorm';

/** ERD §1.9 + SRS §22 — notifications, notification_templates, notification_channels, notification_logs */
export class CreateNotificationsSchema1737650000008 implements MigrationInterface {
  name = 'CreateNotificationsSchema1737650000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notification_channels (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(128) NOT NULL,
        channel_type VARCHAR(32) NOT NULL,
        config JSONB NOT NULL DEFAULT '{}',
        is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_notification_channels_tenant_type ON notification_channels (tenant_id, channel_type);

      CREATE TABLE IF NOT EXISTS notification_templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(128) NOT NULL,
        channel VARCHAR(32) NOT NULL,
        subject VARCHAR(255),
        content JSONB NOT NULL DEFAULT '{}',
        version INT NOT NULL DEFAULT 1,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ,
        UNIQUE (tenant_id, name)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        type VARCHAR(64) NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        recipient VARCHAR(255),
        channel_id UUID REFERENCES notification_channels(id) ON DELETE SET NULL,
        template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
        payload JSONB NOT NULL DEFAULT '{}',
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        scheduled_at TIMESTAMPTZ,
        sent_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_notifications_tenant_user ON notifications (tenant_id, user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_tenant_status ON notifications (tenant_id, status);

      CREATE TABLE IF NOT EXISTS notification_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
        channel_id UUID REFERENCES notification_channels(id) ON DELETE SET NULL,
        status VARCHAR(32) NOT NULL,
        provider_response JSONB NOT NULL DEFAULT '{}',
        error_message TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_notification_logs_notification_created ON notification_logs (notification_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_notification_logs_tenant_status ON notification_logs (tenant_id, status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS notification_logs;
      DROP TABLE IF EXISTS notifications;
      DROP TABLE IF EXISTS notification_templates;
      DROP TABLE IF EXISTS notification_channels;
    `);
  }
}
