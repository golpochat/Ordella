import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('staff_attendance_logs')
@Index(['tenantId', 'employeeId', 'clockInAt'])
@Index(['tenantId', 'shiftId'])
export class StaffAttendanceLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'shift_id', type: 'uuid' })
  shiftId!: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId!: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ name: 'clock_in_at', type: 'timestamptz', nullable: true })
  clockInAt!: Date | null;

  @Column({ name: 'clock_out_at', type: 'timestamptz', nullable: true })
  clockOutAt!: Date | null;

  @Column({ name: 'late_minutes', type: 'int', default: 0 })
  lateMinutes!: number;

  @Column({ name: 'early_leave_minutes', type: 'int', default: 0 })
  earlyLeaveMinutes!: number;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
