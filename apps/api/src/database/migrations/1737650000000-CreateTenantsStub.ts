import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Minimal tenants table required by auth FK constraints (ERD §1.1).
 * Full tenants module will extend this in a future migration.
 */
export class CreateTenantsStub1737650000000 implements MigrationInterface {
  name = 'CreateTenantsStub1737650000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS tenants CASCADE;`);
  }
}
