import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnterpriseAdmin1737650000073 implements MigrationInterface {
  name = 'CreateEnterpriseAdmin1737650000073';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS enterprise_organizations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(160) NOT NULL,
        slug VARCHAR(160) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        global_settings JSONB NOT NULL DEFAULT '{}',
        tax_rules JSONB NOT NULL DEFAULT '{}',
        promotion_policy JSONB NOT NULL DEFAULT '{}',
        catalog_policy JSONB NOT NULL DEFAULT '{}',
        sso_policy JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, slug)
      );

      CREATE TABLE IF NOT EXISTS enterprise_regions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        organization_id UUID NOT NULL REFERENCES enterprise_organizations(id) ON DELETE CASCADE,
        parent_region_id UUID REFERENCES enterprise_regions(id) ON DELETE SET NULL,
        name VARCHAR(160) NOT NULL,
        region_type VARCHAR(32) NOT NULL DEFAULT 'custom',
        country VARCHAR(2),
        state VARCHAR(80),
        overrides JSONB NOT NULL DEFAULT '{}',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS enterprise_access_assignments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
        scope_type VARCHAR(32) NOT NULL,
        organization_id UUID REFERENCES enterprise_organizations(id) ON DELETE CASCADE,
        region_id UUID REFERENCES enterprise_regions(id) ON DELETE CASCADE,
        location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
        staff_role VARCHAR(48) NOT NULL DEFAULT 'regional_manager',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`ALTER TABLE locations ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES enterprise_regions(id) ON DELETE SET NULL`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_enterprise_regions_tenant_org_name ON enterprise_regions (tenant_id, organization_id, name)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_enterprise_access_user_scope ON enterprise_access_assignments (tenant_id, user_id, scope_type)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_enterprise_access_region ON enterprise_access_assignments (tenant_id, region_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_enterprise_access_location ON enterprise_access_assignments (tenant_id, location_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_locations_region ON locations (tenant_id, region_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_locations_region`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_enterprise_access_location`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_enterprise_access_region`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_enterprise_access_user_scope`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_enterprise_regions_tenant_org_name`);
    await queryRunner.query(`ALTER TABLE locations DROP COLUMN IF EXISTS region_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS enterprise_access_assignments`);
    await queryRunner.query(`DROP TABLE IF EXISTS enterprise_regions`);
    await queryRunner.query(`DROP TABLE IF EXISTS enterprise_organizations`);
  }
}
