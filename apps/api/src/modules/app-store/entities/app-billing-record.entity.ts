import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AppInstallationEntity } from './app-installation.entity';
import { MarketplaceAppEntity } from './marketplace-app.entity';

@Entity('app_billing_records')
@Index(['tenantId', 'appId', 'createdAt'])
@Index(['partnerId', 'createdAt'])
export class AppBillingRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'app_id', type: 'uuid' })
  appId!: string;

  @ManyToOne(() => MarketplaceAppEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  app!: MarketplaceAppEntity;

  @Column({ name: 'installation_id', type: 'uuid' })
  installationId!: string;

  @ManyToOne(() => AppInstallationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'installation_id' })
  installation!: AppInstallationEntity;

  @Column({ name: 'partner_id', type: 'uuid', nullable: true })
  partnerId!: string | null;

  @Column({ type: 'varchar', length: 48 })
  recordType!: 'subscription' | 'one_time' | 'usage' | 'revenue_share' | 'payout' | 'invoice' | 'receipt';

  @Column({ name: 'amount_cents', type: 'int', default: 0 })
  amountCents!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: 'pending' | 'paid' | 'void' | 'failed';

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
