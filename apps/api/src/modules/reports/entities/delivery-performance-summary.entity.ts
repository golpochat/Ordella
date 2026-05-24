import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseTimestampsEntity } from './base-timestamps.entity';

@Entity('delivery_performance_summaries')
@Unique(['tenantId', 'summaryDate'])
@Index(['tenantId', 'summaryDate'])
export class DeliveryPerformanceSummaryEntity extends BaseTimestampsEntity {
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'summary_date', type: 'date' })
  summaryDate!: string;

  @Column({ type: 'int', default: 0 })
  completed!: number;

  @Column({ type: 'int', default: 0 })
  failed!: number;

  @Column({
    name: 'avg_delivery_time_seconds',
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  avgDeliveryTime!: string;
}
