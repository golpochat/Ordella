import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type StaffShiftRole = 'cashier' | 'picker' | 'driver' | 'manager';
export type StaffShiftStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

@Entity('staff_shifts')
@Index(['tenantId', 'employeeId', 'shiftStart'])
@Index(['tenantId', 'locationId', 'shiftStart'])
@Index(['tenantId', 'role', 'status'])
export class StaffShiftEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'schedule_id', type: 'uuid', nullable: true })
  scheduleId!: string | null;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId!: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ type: 'varchar', length: 32 })
  role!: StaffShiftRole;

  @Column({ name: 'shift_start', type: 'timestamptz' })
  shiftStart!: Date;

  @Column({ name: 'shift_end', type: 'timestamptz' })
  shiftEnd!: Date;

  @Column({ name: 'break_rules', type: 'jsonb', default: () => "'{}'" })
  breakRules!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 32, default: 'scheduled' })
  status!: StaffShiftStatus;

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2, default: 0 })
  hourlyRate!: string;

  @Column({ name: 'template_name', type: 'varchar', length: 64, nullable: true })
  templateName!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
