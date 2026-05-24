import { Column, Entity, Index, OneToMany } from 'typeorm';
import { DeliveryTaskStatus } from '../enums/delivery-task-status.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { DeliveryAssignmentEntity } from './delivery-assignment.entity';
import { DeliveryStatusHistoryEntity } from './delivery-status-history.entity';
import { DeliveryEventEntity } from './delivery-event.entity';

/** ERD §1.6 deliveries — API Spec §7.1 `/deliveries` */
@Entity('delivery_tasks')
@Index(['tenantId', 'orderId'])
@Index(['tenantId', 'status'])
export class DeliveryTaskEntity extends BaseTenantScopedEntity {
  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string;

  @Column({ name: 'driver_profile_id', type: 'uuid', nullable: true })
  driverId!: string | null;

  @Column({ type: 'varchar', length: 32, default: DeliveryTaskStatus.PENDING })
  status!: DeliveryTaskStatus;

  @Column({ type: 'timestamptz', nullable: true })
  eta!: Date | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'delivery_fee', type: 'decimal', precision: 12, scale: 2, nullable: true })
  deliveryFee!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @OneToMany(() => DeliveryAssignmentEntity, (assignment) => assignment.deliveryTask)
  assignments!: DeliveryAssignmentEntity[];

  @OneToMany(() => DeliveryStatusHistoryEntity, (history) => history.deliveryTask)
  statusHistory!: DeliveryStatusHistoryEntity[];

  @OneToMany(() => DeliveryEventEntity, (event) => event.deliveryTask)
  events!: DeliveryEventEntity[];
}
