import { Column, Entity, Index } from 'typeorm';
import { BaseTimestampsEntity } from '../../orders/entities/base-timestamps.entity';
import { KdsLineStatus } from '../enums/kds-line-status.enum';

@Entity('kds_order_item_states')
@Index(['tenantId', 'orderId'])
export class KdsOrderItemStateEntity extends BaseTimestampsEntity {
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string;

  @Column({ name: 'order_item_id', type: 'uuid', unique: true })
  orderItemId!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  station!: string | null;

  @Column({ type: 'varchar', length: 32, default: KdsLineStatus.PENDING })
  status!: KdsLineStatus;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;
}
