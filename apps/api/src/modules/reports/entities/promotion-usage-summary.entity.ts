import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseTimestampsEntity } from './base-timestamps.entity';

@Entity('promotion_usage_summaries')
@Unique(['tenantId', 'summaryDate', 'promotionId'])
@Index(['tenantId', 'summaryDate'])
export class PromotionUsageSummaryEntity extends BaseTimestampsEntity {
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'summary_date', type: 'date' })
  summaryDate!: string;

  @Column({ name: 'promotion_id', type: 'uuid' })
  promotionId!: string;

  @Column({ name: 'application_count', type: 'int', default: 0 })
  applicationCount!: number;

  @Column({ name: 'total_discount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalDiscount!: string;
}
