import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MarketplaceAppEntity } from './marketplace-app.entity';

@Entity('app_installations')
@Index(['tenantId', 'appId'], { unique: true })
@Index(['tenantId', 'status'])
export class AppInstallationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'app_id', type: 'uuid' })
  appId!: string;

  @ManyToOne(() => MarketplaceAppEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  app!: MarketplaceAppEntity;

  @Column({ name: 'installed_by_user_id', type: 'uuid', nullable: true })
  installedByUserId!: string | null;

  @Column({ type: 'varchar', length: 32, default: 'installed' })
  status!: 'installed' | 'uninstalled' | 'suspended' | 'sandbox';

  @Column({ name: 'granted_scopes', type: 'jsonb', default: () => "'[]'" })
  grantedScopes!: string[];

  @Column({ name: 'webhook_events', type: 'jsonb', default: () => "'[]'" })
  webhookEvents!: string[];

  @Column({ name: 'api_key_id', type: 'uuid', nullable: true })
  apiKeyId!: string | null;

  @Column({ name: 'webhook_id', type: 'uuid', nullable: true })
  webhookId!: string | null;

  @Column({ name: 'oauth_client_id', type: 'varchar', length: 128, nullable: true })
  oauthClientId!: string | null;

  @Column({ name: 'rate_limit_per_minute', type: 'int', default: 1000 })
  rateLimitPerMinute!: number;

  @Column({ name: 'billing_status', type: 'varchar', length: 32, default: 'free' })
  billingStatus!: 'free' | 'trialing' | 'active' | 'past_due' | 'cancelled';

  @Column({ name: 'billing_cycle_anchor', type: 'timestamptz', nullable: true })
  billingCycleAnchor!: Date | null;

  @Column({ name: 'usage_counters', type: 'jsonb', default: () => "'{}'" })
  usageCounters!: Record<string, number>;

  @Column({ name: 'consent_snapshot', type: 'jsonb', default: () => "'{}'" })
  consentSnapshot!: Record<string, unknown>;

  @Column({ name: 'installed_at', type: 'timestamptz', default: () => 'NOW()' })
  installedAt!: Date;

  @Column({ name: 'uninstalled_at', type: 'timestamptz', nullable: true })
  uninstalledAt!: Date | null;
}
