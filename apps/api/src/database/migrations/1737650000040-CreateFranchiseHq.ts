import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFranchiseHq1737650000040 implements MigrationInterface {
  name = 'CreateFranchiseHq1737650000040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tenants
        ADD COLUMN IF NOT EXISTS parent_tenant_id UUID NULL REFERENCES tenants(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS tenant_type VARCHAR(32) NOT NULL DEFAULT 'single-location';

      CREATE INDEX IF NOT EXISTS idx_tenants_parent_tenant_id ON tenants(parent_tenant_id);

      CREATE TABLE IF NOT EXISTS franchise_groups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        hq_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        franchisee_tenant_ids UUID[] NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_franchise_groups_hq_tenant_id ON franchise_groups(hq_tenant_id);

      INSERT INTO permissions (key, description)
      VALUES
        ('admin:franchise-hq', 'Access Franchise HQ dashboard'),
        ('hq.analytics.read', 'View franchise analytics'),
        ('hq.orders.read', 'View franchise orders'),
        ('hq.inventory.read', 'View franchise inventory'),
        ('hq.staff.read', 'View franchise staff'),
        ('hq.franchisees.create', 'Create franchisee tenants')
      ON CONFLICT (key) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM permissions
      WHERE key IN (
        'admin:franchise-hq',
        'hq.analytics.read',
        'hq.orders.read',
        'hq.inventory.read',
        'hq.staff.read',
        'hq.franchisees.create'
      );
      DROP INDEX IF EXISTS idx_franchise_groups_hq_tenant_id;
      DROP TABLE IF EXISTS franchise_groups;
      DROP INDEX IF EXISTS idx_tenants_parent_tenant_id;
      ALTER TABLE tenants
        DROP COLUMN IF EXISTS tenant_type,
        DROP COLUMN IF EXISTS parent_tenant_id;
    `);
  }
}
