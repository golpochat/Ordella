import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';

export type StaffScheduleStatus = 'draft' | 'published' | 'archived';

@Entity('staff_schedules')
@Index(['tenantId', 'locationId', 'weekStart'])
export class StaffScheduleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId!: string;

  @Column({ name: 'week_start', type: 'date' })
  weekStart!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status!: StaffScheduleStatus;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
