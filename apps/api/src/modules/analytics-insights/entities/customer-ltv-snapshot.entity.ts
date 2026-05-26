import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_ltv_snapshots')
@Index(['tenantId', 'customerId', 'snapshotDate'])
export class CustomerLtvSnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @Column({ name: 'snapshot_date', type: 'date' })
  snapshotDate!: string;

  @Column({ name: 'lifetime_value', type: 'decimal', precision: 12, scale: 2, default: 0 })
  lifetimeValue!: string;

  @Column({ name: 'predicted_ltv', type: 'decimal', precision: 12, scale: 2, default: 0 })
  predictedLtv!: string;

  @Column({ name: 'avg_order_value', type: 'decimal', precision: 12, scale: 2, default: 0 })
  avgOrderValue!: string;

  @Column({ name: 'order_count', type: 'int', default: 0 })
  orderCount!: number;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  parameters!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
