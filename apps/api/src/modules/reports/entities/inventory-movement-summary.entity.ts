import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseTimestampsEntity } from './base-timestamps.entity';

@Entity('inventory_movement_summaries')
@Unique(['tenantId', 'summaryDate', 'productId'])
@Index(['tenantId', 'summaryDate'])
export class InventoryMovementSummaryEntity extends BaseTimestampsEntity {
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'summary_date', type: 'date' })
  summaryDate!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'quantity_in', type: 'decimal', precision: 14, scale: 4, default: 0 })
  quantityIn!: string;

  @Column({ name: 'quantity_out', type: 'decimal', precision: 14, scale: 4, default: 0 })
  quantityOut!: string;
}
