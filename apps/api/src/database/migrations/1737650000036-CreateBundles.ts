import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBundles1737650000036 implements MigrationInterface {
  name = 'CreateBundles1737650000036';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS bundles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL,
        location_id UUID,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price_type VARCHAR(32) NOT NULL DEFAULT 'dynamic',
        fixed_price DECIMAL(12, 2),
        discount_amount DECIMAL(12, 2),
        discount_percent DECIMAL(5, 2),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_bundles_tenant_active ON bundles (tenant_id, is_active)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_bundles_tenant_location ON bundles (tenant_id, location_id)`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS bundle_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
        item_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INT NOT NULL,
        is_optional BOOLEAN NOT NULL DEFAULT false,
        min_select INT,
        max_select INT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle ON bundle_items (bundle_id)`);
    await queryRunner.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS bundle_id UUID`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE order_items DROP COLUMN IF EXISTS bundle_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_bundle_items_bundle`);
    await queryRunner.query(`DROP TABLE IF EXISTS bundle_items`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_bundles_tenant_location`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_bundles_tenant_active`);
    await queryRunner.query(`DROP TABLE IF EXISTS bundles`);
  }
}
