import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('loyalty_settings')
@Index(['tenantId'], { unique: true })
export class LoyaltySettingsEntity {
  @PrimaryColumn({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled!: boolean;

  @Column({ name: 'earn_rate', type: 'decimal', precision: 10, scale: 4, default: 1 })
  earnRate!: string;

  @Column({ name: 'redeem_rate', type: 'decimal', precision: 10, scale: 4, default: 0.01 })
  redeemRate!: string;

  @Column({ name: 'auto_enroll', type: 'boolean', default: true })
  autoEnroll!: boolean;

  @Column({ name: 'min_redeem_points', type: 'int', default: 100 })
  minRedeemPoints!: number;

  @Column({ name: 'max_redeem_percent', type: 'int', default: 50 })
  maxRedeemPercent!: number;
}
