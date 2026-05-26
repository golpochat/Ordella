import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('analytics_insight_settings')
export class AnalyticsInsightSettingsEntity {
  @PrimaryColumn({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({
    name: 'segmentation_rules',
    type: 'jsonb',
    default: () => `'{"highValuePercentile":0.8,"frequentBuyerOrders":4,"newCustomerDays":30}'`,
  })
  segmentationRules!: Record<string, unknown>;

  @Column({
    name: 'ltv_parameters',
    type: 'jsonb',
    default: () => `'{"predictionMonths":6,"grossMarginPercent":35,"discountRatePercent":8}'`,
  })
  ltvParameters!: Record<string, unknown>;

  @Column({
    name: 'churn_thresholds',
    type: 'jsonb',
    default: () => `'{"medium":45,"high":65,"critical":85,"inactiveDays":60}'`,
  })
  churnThresholds!: Record<string, unknown>;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
