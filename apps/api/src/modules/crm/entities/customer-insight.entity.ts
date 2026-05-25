import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CustomerEntity } from '../../loyalty/entities';

@Entity('customer_insights')
@Index(['tenantId', 'customerId'], { unique: true })
export class CustomerInsightEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerEntity;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'jsonb', default: {} })
  metrics!: Record<string, unknown>;

  @Column({ name: 'categories_purchased', type: 'text', array: true, default: () => "'{}'" })
  categoriesPurchased!: string[];

  @Column({ name: 'order_frequency', type: 'varchar', length: 64, default: 'no_orders' })
  orderFrequency!: string;

  @Column({ name: 'churn_risk_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  churnRiskScore!: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
