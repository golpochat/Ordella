import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStaffScheduling1737650000062 implements MigrationInterface {
  name = 'CreateStaffScheduling1737650000062';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS staff_schedules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        week_start DATE NOT NULL,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'draft',
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NULL
      );
      CREATE INDEX IF NOT EXISTS idx_staff_schedules_tenant_location_week ON staff_schedules(tenant_id, location_id, week_start);

      CREATE TABLE IF NOT EXISTS staff_shifts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        schedule_id UUID NULL REFERENCES staff_schedules(id) ON DELETE SET NULL,
        employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        role VARCHAR(32) NOT NULL,
        shift_start TIMESTAMPTZ NOT NULL,
        shift_end TIMESTAMPTZ NOT NULL,
        break_rules JSONB NOT NULL DEFAULT '{}',
        status VARCHAR(32) NOT NULL DEFAULT 'scheduled',
        hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
        template_name VARCHAR(64) NULL,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NULL
      );
      CREATE INDEX IF NOT EXISTS idx_staff_shifts_tenant_employee_start ON staff_shifts(tenant_id, employee_id, shift_start);
      CREATE INDEX IF NOT EXISTS idx_staff_shifts_tenant_location_start ON staff_shifts(tenant_id, location_id, shift_start);
      CREATE INDEX IF NOT EXISTS idx_staff_shifts_tenant_role_status ON staff_shifts(tenant_id, role, status);

      CREATE TABLE IF NOT EXISTS staff_attendance_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        shift_id UUID NOT NULL REFERENCES staff_shifts(id) ON DELETE CASCADE,
        employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        clock_in_at TIMESTAMPTZ NULL,
        clock_out_at TIMESTAMPTZ NULL,
        late_minutes INT NOT NULL DEFAULT 0,
        early_leave_minutes INT NOT NULL DEFAULT 0,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_staff_attendance_tenant_employee_clock ON staff_attendance_logs(tenant_id, employee_id, clock_in_at);
      CREATE INDEX IF NOT EXISTS idx_staff_attendance_tenant_shift ON staff_attendance_logs(tenant_id, shift_id);

      CREATE TABLE IF NOT EXISTS staff_time_off_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        start_at TIMESTAMPTZ NOT NULL,
        end_at TIMESTAMPTZ NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        reason TEXT NULL,
        reviewed_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NULL
      );
      CREATE INDEX IF NOT EXISTS idx_staff_time_off_tenant_employee_start ON staff_time_off_requests(tenant_id, employee_id, start_at);
      CREATE INDEX IF NOT EXISTS idx_staff_time_off_tenant_status ON staff_time_off_requests(tenant_id, status);

      CREATE TABLE IF NOT EXISTS staff_shift_swap_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        shift_id UUID NOT NULL REFERENCES staff_shifts(id) ON DELETE CASCADE,
        requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        target_employee_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        note TEXT NULL,
        reviewed_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NULL
      );
      CREATE INDEX IF NOT EXISTS idx_staff_shift_swaps_tenant_requester_status ON staff_shift_swap_requests(tenant_id, requester_id, status);
      CREATE INDEX IF NOT EXISTS idx_staff_shift_swaps_tenant_shift ON staff_shift_swap_requests(tenant_id, shift_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_staff_shift_swaps_tenant_shift;
      DROP INDEX IF EXISTS idx_staff_shift_swaps_tenant_requester_status;
      DROP TABLE IF EXISTS staff_shift_swap_requests;
      DROP INDEX IF EXISTS idx_staff_time_off_tenant_status;
      DROP INDEX IF EXISTS idx_staff_time_off_tenant_employee_start;
      DROP TABLE IF EXISTS staff_time_off_requests;
      DROP INDEX IF EXISTS idx_staff_attendance_tenant_shift;
      DROP INDEX IF EXISTS idx_staff_attendance_tenant_employee_clock;
      DROP TABLE IF EXISTS staff_attendance_logs;
      DROP INDEX IF EXISTS idx_staff_shifts_tenant_role_status;
      DROP INDEX IF EXISTS idx_staff_shifts_tenant_location_start;
      DROP INDEX IF EXISTS idx_staff_shifts_tenant_employee_start;
      DROP TABLE IF EXISTS staff_shifts;
      DROP INDEX IF EXISTS idx_staff_schedules_tenant_location_week;
      DROP TABLE IF EXISTS staff_schedules;
    `);
  }
}
