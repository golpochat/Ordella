import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseTimestampsEntity } from './base-timestamps.entity';

@Entity('daily_sales_summaries')
@Unique(['tenantId', 'summaryDate'])
@Index(['tenantId', 'summaryDate'])
export class DailySalesSummaryEntity extends BaseTimestampsEntity {
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'summary_date', type: 'date' })
  summaryDate!: string;

  @Column({ name: 'total_orders', type: 'int', default: 0 })
  totalOrders!: number;

  @Column({ name: 'total_revenue', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalRevenue!: string;

  @Column({ name: 'total_discounts', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalDiscounts!: string;

  @Column({ name: 'total_refunds', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalRefunds!: string;
}
