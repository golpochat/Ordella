import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Tenants domain — extends stub `tenants` table; adds stores, locations,
 * location_settings, location_opening_hours (SRS §2, API Spec §2, ERD §1.1).
 */
export class CreateTenantsStoresLocationsSchema1737650000002 implements MigrationInterface {
  name = 'CreateTenantsStoresLocationsSchema1737650000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tenants
        ADD COLUMN IF NOT EXISTS slug VARCHAR(128) UNIQUE,
        ADD COLUMN IF NOT EXISTS subdomain VARCHAR(255) UNIQUE;

      CREATE TABLE IF NOT EXISTS stores (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(128),
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, name)
      );

      CREATE TABLE IF NOT EXISTS locations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
        status VARCHAR(32) NOT NULL DEFAULT 'closed',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_locations_tenant_id ON locations (tenant_id);
      CREATE INDEX IF NOT EXISTS idx_locations_store_id ON locations (store_id);

      CREATE TABLE IF NOT EXISTS location_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        location_id UUID NOT NULL UNIQUE REFERENCES locations(id) ON DELETE CASCADE,
        settings JSONB NOT NULL DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS location_opening_hours (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        day_of_week SMALLINT NOT NULL,
        open_time TIME,
        close_time TIME,
        is_closed BOOLEAN NOT NULL DEFAULT FALSE,
        UNIQUE (location_id, day_of_week)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS location_opening_hours;
      DROP TABLE IF EXISTS location_settings;
      DROP TABLE IF EXISTS locations;
      DROP TABLE IF EXISTS stores;
      ALTER TABLE tenants DROP COLUMN IF EXISTS slug;
      ALTER TABLE tenants DROP COLUMN IF EXISTS subdomain;
    `);
  }
}
