import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateThemes1737650000038 implements MigrationInterface {
  name = 'CreateThemes1737650000038';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS themes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(128) NOT NULL,
        base_theme VARCHAR(32) NOT NULL DEFAULT 'default',
        colors JSONB NOT NULL DEFAULT '{}',
        typography JSONB NOT NULL DEFAULT '{}',
        layout JSONB NOT NULL DEFAULT '{}',
        homepage_sections JSONB NOT NULL DEFAULT '[]',
        assets JSONB NOT NULL DEFAULT '{}',
        seo JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS idx_themes_tenant_active ON themes (tenant_id, is_active);

      CREATE TABLE IF NOT EXISTS theme_assets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
        type VARCHAR(32) NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_theme_assets_theme_type ON theme_assets (theme_id, type);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_theme_assets_theme_type;
      DROP TABLE IF EXISTS theme_assets;
      DROP INDEX IF EXISTS idx_themes_tenant_active;
      DROP TABLE IF EXISTS themes;
    `);
  }
}
