import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DeliveryTaskEntity } from './delivery-task.entity';

@Entity('delivery_events')
@Index(['tenantId', 'deliveryTaskId', 'createdAt'])
export class DeliveryEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'delivery_task_id', type: 'uuid' })
  deliveryTaskId!: string;

  @ManyToOne(() => DeliveryTaskEntity, (task) => task.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'delivery_task_id' })
  deliveryTask!: DeliveryTaskEntity;

  @Column({ type: 'varchar', length: 64 })
  type!: string;

  @Column({ type: 'jsonb', default: {} })
  payload!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
