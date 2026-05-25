import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationPreferencesAndChannel1737650000027 implements MigrationInterface {
  name = 'NotificationPreferencesAndChannel1737650000027';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE notifications
      ADD COLUMN IF NOT EXISTS channel VARCHAR(32) NOT NULL DEFAULT 'email';
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        categories JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ,
        UNIQUE (tenant_id, user_id)
      );
    `);

    await queryRunner.query(`
      WITH permission_keys(key) AS (
        VALUES
          ('notifications:read'),
          ('notifications:create'),
          ('notification-logs:read'),
          ('notification-templates:read'),
          ('notification-templates:create'),
          ('notification-templates:update'),
          ('notification-channels:read'),
          ('notification-channels:create'),
          ('notification-channels:update'),
          ('notification-channels:delete')
      )
      INSERT INTO permissions (key, description)
      SELECT key, key FROM permission_keys
      ON CONFLICT (key) DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT roles.id, permissions.id
      FROM roles
      JOIN permissions ON permissions.key IN (
        'notifications:read',
        'notifications:create',
        'notification-logs:read',
        'notification-templates:read',
        'notification-templates:create',
        'notification-templates:update',
        'notification-channels:read',
        'notification-channels:create',
        'notification-channels:update',
        'notification-channels:delete'
      )
      WHERE roles.name IN ('owner', 'manager')
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS notification_preferences`);
    await queryRunner.query(`ALTER TABLE notifications DROP COLUMN IF EXISTS channel`);
  }
}
