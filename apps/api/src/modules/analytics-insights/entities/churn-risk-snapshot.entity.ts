import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('churn_risk_snapshots')
@Index(['tenantId', 'customerId', 'snapshotDate'])
@Index(['tenantId', 'riskBand'])
export class ChurnRiskSnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @Column({ name: 'snapshot_date', type: 'date' })
  snapshotDate!: string;

  @Column({ name: 'risk_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  riskScore!: string;

  @Column({ name: 'risk_band', type: 'varchar', length: 32 })
  riskBand!: 'low' | 'medium' | 'high' | 'critical';

  @Column({ type: 'jsonb', default: () => "'{}'" })
  factors!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
