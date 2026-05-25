import { MigrationInterface, QueryRunner } from 'typeorm';

export class StaffRbacEnhancements1737650000026 implements MigrationInterface {
  name = 'StaffRbacEnhancements1737650000026';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS phone VARCHAR(32);
    `);

    await queryRunner.query(`
      WITH permission_keys(key) AS (
        VALUES
          ('catalog.read'), ('catalog.write'),
          ('inventory.read'), ('inventory.write'),
          ('orders.read'), ('orders.write'),
          ('fulfillment.read'), ('fulfillment.write'),
          ('staff.read'), ('staff.write'),
          ('locations.read'), ('locations.write'),
          ('billing.read'), ('billing.write'),
          ('analytics.read'),
          ('roles:update'), ('roles:delete'),
          ('admin:access'), ('admin:products'), ('admin:inventory'), ('admin:orders'),
          ('admin:reports'), ('admin:settings'),
          ('pos:access'), ('pos:catalog'), ('pos:cart'), ('pos:checkout'),
          ('pos:payment'), ('pos:receipt'),
          ('kds:access'), ('kds:read'), ('kds:update'),
          ('deliveries:read'), ('deliveries:update'),
          ('users:read'), ('users:create'), ('users:update'), ('users:delete'),
          ('roles:read'), ('roles:create'), ('roles:assign'),
          ('permissions:read')
      )
      INSERT INTO permissions (key, description)
      SELECT key, key FROM permission_keys
      ON CONFLICT (key) DO NOTHING;
    `);

    await queryRunner.query(`
      WITH role_names(name, description) AS (
        VALUES
          ('owner', 'Default owner role'),
          ('manager', 'Default manager role'),
          ('staff', 'Default staff role'),
          ('driver', 'Default driver role'),
          ('fulfillment', 'Default fulfillment role')
      )
      INSERT INTO roles (tenant_id, name, description)
      SELECT tenants.id, role_names.name, role_names.description
      FROM tenants
      CROSS JOIN role_names
      ON CONFLICT (tenant_id, name) DO NOTHING;
    `);

    await queryRunner.query(`
      WITH role_permission_keys(role_name, permission_key) AS (
        VALUES
          ('manager', 'catalog.read'), ('manager', 'catalog.write'),
          ('manager', 'inventory.read'), ('manager', 'inventory.write'),
          ('manager', 'orders.read'), ('manager', 'orders.write'),
          ('manager', 'fulfillment.read'), ('manager', 'fulfillment.write'),
          ('manager', 'staff.read'), ('manager', 'staff.write'),
          ('manager', 'locations.read'), ('manager', 'locations.write'),
          ('manager', 'analytics.read'),
          ('manager', 'admin:access'), ('manager', 'admin:products'),
          ('manager', 'admin:inventory'), ('manager', 'admin:orders'),
          ('manager', 'admin:reports'),
          ('manager', 'permissions:read'),
          ('manager', 'pos:catalog'), ('manager', 'pos:cart'),
          ('manager', 'pos:checkout'), ('manager', 'pos:payment'),
          ('manager', 'pos:receipt'), ('manager', 'kds:access'),
          ('manager', 'kds:read'), ('manager', 'kds:update'),
          ('staff', 'orders.read'), ('staff', 'orders.write'),
          ('staff', 'fulfillment.read'), ('staff', 'fulfillment.write'),
          ('staff', 'pos:access'), ('staff', 'pos:catalog'),
          ('staff', 'pos:cart'), ('staff', 'pos:checkout'),
          ('staff', 'pos:payment'), ('staff', 'pos:receipt'),
          ('staff', 'kds:access'), ('staff', 'kds:read'), ('staff', 'kds:update'),
          ('driver', 'deliveries:read'), ('driver', 'deliveries:update'),
          ('fulfillment', 'fulfillment.read'), ('fulfillment', 'fulfillment.write'),
          ('fulfillment', 'kds:access'), ('fulfillment', 'kds:read'),
          ('fulfillment', 'kds:update'), ('fulfillment', 'orders:read')
      )
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT roles.id, permissions.id
      FROM roles
      JOIN role_permission_keys ON role_permission_keys.role_name = roles.name
      JOIN permissions ON permissions.key = role_permission_keys.permission_key
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT roles.id, permissions.id
      FROM roles
      CROSS JOIN permissions
      WHERE roles.name = 'owner'
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS phone`);
  }
}
