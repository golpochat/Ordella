import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AppPartnerEntity } from './app-partner.entity';
import { AppVersionEntity } from './app-version.entity';

export type AppPricingModel = 'free' | 'one_time' | 'monthly_subscription' | 'usage_based' | 'revenue_share';

@Entity('marketplace_apps')
@Index(['slug'], { unique: true })
@Index(['category', 'status'])
export class MarketplaceAppEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'partner_id', type: 'uuid', nullable: true })
  partnerId!: string | null;

  @ManyToOne(() => AppPartnerEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'partner_id' })
  partner!: AppPartnerEntity | null;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'varchar', length: 160 })
  slug!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 160 })
  provider!: string;

  @Column({ type: 'varchar', length: 48 })
  category!: string;

  @Column({ name: 'pricing_model', type: 'varchar', length: 48, default: 'free' })
  pricingModel!: AppPricingModel;

  @Column({ name: 'price_cents', type: 'int', default: 0 })
  priceCents!: number;

  @Column({ name: 'usage_unit', type: 'varchar', length: 48, nullable: true })
  usageUnit!: 'api_calls' | 'orders_processed' | null;

  @Column({ name: 'revenue_share_bps', type: 'int', default: 0 })
  revenueShareBps!: number;

  @Column({ type: 'varchar', length: 32, default: 'approved' })
  status!: 'draft' | 'submitted' | 'approved' | 'rejected' | 'sandbox';

  @Column({ name: 'requested_scopes', type: 'jsonb', default: () => "'[]'" })
  requestedScopes!: string[];

  @Column({ name: 'webhook_events', type: 'jsonb', default: () => "'[]'" })
  webhookEvents!: string[];

  @Column({ name: 'rate_limit_per_minute', type: 'int', default: 1000 })
  rateLimitPerMinute!: number;

  @Column({ name: 'icon_url', type: 'varchar', length: 512, nullable: true })
  iconUrl!: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  screenshots!: string[];

  @Column({ name: 'docs_url', type: 'varchar', length: 512, nullable: true })
  docsUrl!: string | null;

  @Column({ name: 'oauth_redirect_urls', type: 'jsonb', default: () => "'[]'" })
  oauthRedirectUrls!: string[];

  @Column({ name: 'client_id', type: 'varchar', length: 128, nullable: true })
  clientId!: string | null;

  @Column({ name: 'client_secret_hash', type: 'varchar', length: 128, nullable: true })
  clientSecretHash!: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;

  @OneToMany(() => AppVersionEntity, (version) => version.app)
  versions!: AppVersionEntity[];
}
