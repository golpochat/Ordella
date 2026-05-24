import { MigrationInterface, QueryRunner } from 'typeorm';

/** ERD §1.6 + SRS §28 — delivery_tasks, driver_profiles, delivery_assignments, delivery_status_history */
export class CreateDeliverySchema1737650000007 implements MigrationInterface {
  name = 'CreateDeliverySchema1737650000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS driver_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(128) NOT NULL,
        phone VARCHAR(32) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        vehicle_type VARCHAR(32),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_driver_profiles_tenant_status ON driver_profiles (tenant_id, status);

      CREATE TABLE IF NOT EXISTS delivery_tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
        driver_profile_id UUID REFERENCES driver_profiles(id) ON DELETE SET NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        eta TIMESTAMPTZ,
        delivery_fee DECIMAL(12, 2),
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_delivery_tasks_tenant_order ON delivery_tasks (tenant_id, order_id);
      CREATE INDEX IF NOT EXISTS idx_delivery_tasks_tenant_status ON delivery_tasks (tenant_id, status);

      CREATE TABLE IF NOT EXISTS delivery_assignments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        delivery_task_id UUID NOT NULL REFERENCES delivery_tasks(id) ON DELETE CASCADE,
        driver_profile_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE RESTRICT,
        assignment_type VARCHAR(16) NOT NULL DEFAULT 'manual',
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        accepted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_delivery_assignments_task_created ON delivery_assignments (delivery_task_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_delivery_assignments_driver_status ON delivery_assignments (driver_profile_id, status);

      CREATE TABLE IF NOT EXISTS delivery_status_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        delivery_task_id UUID NOT NULL REFERENCES delivery_tasks(id) ON DELETE CASCADE,
        from_status VARCHAR(32),
        to_status VARCHAR(32) NOT NULL,
        changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
        reason TEXT,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_delivery_status_history_task_created ON delivery_status_history (delivery_task_id, created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS delivery_status_history;
      DROP TABLE IF EXISTS delivery_assignments;
      DROP TABLE IF EXISTS delivery_tasks;
      DROP TABLE IF EXISTS driver_profiles;
    `);
  }
}
