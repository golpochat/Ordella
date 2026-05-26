import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { StaffRequestStatus } from './staff-time-off-request.entity';

@Entity('staff_shift_swap_requests')
@Index(['tenantId', 'requesterId', 'status'])
@Index(['tenantId', 'shiftId'])
export class StaffShiftSwapRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'shift_id', type: 'uuid' })
  shiftId!: string;

  @Column({ name: 'requester_id', type: 'uuid' })
  requesterId!: string;

  @Column({ name: 'target_employee_id', type: 'uuid', nullable: true })
  targetEmployeeId!: string | null;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: StaffRequestStatus;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
