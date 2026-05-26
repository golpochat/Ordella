import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationSettingsAndTemplateChannelIndex1737650000059 implements MigrationInterface {
  name = 'AddNotificationSettingsAndTemplateChannelIndex1737650000059';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tenant_settings
        ADD COLUMN IF NOT EXISTS notification_email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS notification_sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS notification_push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS notification_from_name VARCHAR(128) NOT NULL DEFAULT 'Ordella',
        ADD COLUMN IF NOT EXISTS notification_from_email VARCHAR(255) NOT NULL DEFAULT 'noreply@ordella.app';

      DROP INDEX IF EXISTS IDX_notification_templates_tenant_id_name;
      DROP INDEX IF EXISTS idx_notification_templates_tenant_name;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_templates_tenant_name_channel
        ON notification_templates(tenant_id, name, channel);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_notification_templates_tenant_name_channel;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_templates_tenant_name
        ON notification_templates(tenant_id, name);

      ALTER TABLE tenant_settings
        DROP COLUMN IF EXISTS notification_from_email,
        DROP COLUMN IF EXISTS notification_from_name,
        DROP COLUMN IF EXISTS notification_push_enabled,
        DROP COLUMN IF EXISTS notification_sms_enabled,
        DROP COLUMN IF EXISTS notification_email_enabled;
    `);
  }
}
