import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('basket_affinity_snapshots')
@Index(['tenantId', 'productId', 'relatedProductId'])
export class BasketAffinitySnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'related_product_id', type: 'uuid' })
  relatedProductId!: string;

  @Column({ name: 'snapshot_date', type: 'date' })
  snapshotDate!: string;

  @Column({ name: 'order_count', type: 'int', default: 0 })
  orderCount!: number;

  @Column({ type: 'decimal', precision: 8, scale: 4, default: 0 })
  support!: string;

  @Column({ type: 'decimal', precision: 8, scale: 4, default: 0 })
  confidence!: string;

  @Column({ type: 'decimal', precision: 8, scale: 4, default: 0 })
  lift!: string;

  @Column({ name: 'affinity_score', type: 'decimal', precision: 8, scale: 2, default: 0 })
  affinityScore!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
