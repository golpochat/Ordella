import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { DeliveryAssignmentStatus } from '../enums/delivery-assignment-status.enum';
import { DeliveryAssignmentType } from '../enums/delivery-assignment-type.enum';
import { BaseTimestampsEntity } from './base-timestamps.entity';
import { DeliveryTaskEntity } from './delivery-task.entity';
import { DriverProfileEntity } from './driver-profile.entity';

/** SRS §28 — driver assignment (manual / auto) */
@Entity('delivery_assignments')
@Index(['deliveryTaskId', 'createdAt'])
@Index(['driverProfileId', 'status'])
export class DeliveryAssignmentEntity extends BaseTimestampsEntity {
  @Column({ name: 'delivery_task_id', type: 'uuid' })
  deliveryTaskId!: string;

  @ManyToOne(() => DeliveryTaskEntity, (task) => task.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'delivery_task_id' })
  deliveryTask!: DeliveryTaskEntity;

  @Column({ name: 'driver_profile_id', type: 'uuid' })
  driverProfileId!: string;

  @ManyToOne(() => DriverProfileEntity, (driver) => driver.assignments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'driver_profile_id' })
  driverProfile!: DriverProfileEntity;

  @Column({ name: 'assignment_type', type: 'varchar', length: 16, default: DeliveryAssignmentType.MANUAL })
  assignmentType!: DeliveryAssignmentType;

  @Column({ type: 'varchar', length: 32, default: DeliveryAssignmentStatus.PENDING })
  status!: DeliveryAssignmentStatus;

  @Column({ name: 'assigned_at', type: 'timestamptz', default: () => 'NOW()' })
  assignedAt!: Date;

  @Column({ name: 'accepted_at', type: 'timestamptz', nullable: true })
  acceptedAt!: Date | null;
}
