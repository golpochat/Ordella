import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DeliveryTaskStatus } from '../enums/delivery-task-status.enum';
import { DeliveryTaskEntity } from './delivery-task.entity';

/** SRS §28 / §44 — delivery audit log */
@Entity('delivery_status_history')
@Index(['deliveryTaskId', 'createdAt'])
export class DeliveryStatusHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'delivery_task_id', type: 'uuid' })
  deliveryTaskId!: string;

  @ManyToOne(() => DeliveryTaskEntity, (task) => task.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'delivery_task_id' })
  deliveryTask!: DeliveryTaskEntity;

  @Column({ name: 'from_status', type: 'varchar', length: 32, nullable: true })
  fromStatus!: DeliveryTaskStatus | null;

  @Column({ name: 'to_status', type: 'varchar', length: 32 })
  toStatus!: DeliveryTaskStatus;

  @Column({ name: 'changed_by', type: 'uuid', nullable: true })
  changedBy!: string | null;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
