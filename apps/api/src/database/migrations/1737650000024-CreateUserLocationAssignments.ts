import { MigrationInterface, QueryRunner } from 'typeorm';

/** Staff can be assigned to one or more business locations */
export class CreateUserLocationAssignments1737650000024 implements MigrationInterface {
  name = 'CreateUserLocationAssignments1737650000024';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_location_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (user_id, location_id)
      );
      CREATE INDEX IF NOT EXISTS idx_user_location_assignments_tenant
        ON user_location_assignments (tenant_id);
      CREATE INDEX IF NOT EXISTS idx_user_location_assignments_location
        ON user_location_assignments (location_id);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS user_location_assignments`);
  }
}
