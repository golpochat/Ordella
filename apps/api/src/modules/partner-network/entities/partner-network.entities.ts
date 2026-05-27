import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('partner_tiers')
@Index(['tenantId', 'tierKey'], { unique: true })
export class PartnerTierEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'tier_key', type: 'varchar', length: 32 })
  tierKey!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 64 })
  displayName!: string;

  @Column({ name: 'commission_rate_bps', type: 'int', default: 0 })
  commissionRateBps!: number;

  @Column({ name: 'reseller_pricing_discount_bps', type: 'int', default: 0 })
  resellerPricingDiscountBps!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('partner_profiles')
@Index(['tenantId', 'appPartnerId'], { unique: true })
export class PartnerProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'app_partner_id', type: 'uuid' })
  appPartnerId!: string;

  @Column({ name: 'tier_id', type: 'uuid', nullable: true })
  tierId!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  certifications!: Record<string, unknown>;

  @Column({ name: 'compliance_status', type: 'varchar', length: 32, default: 'pending' })
  complianceStatus!: string;

  @Column({ name: 'sandbox_enabled', type: 'boolean', default: false })
  sandboxEnabled!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('partner_regions')
@Index(['tenantId', 'appPartnerId', 'regionCode'], { unique: true })
export class PartnerRegionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'app_partner_id', type: 'uuid' })
  appPartnerId!: string;

  @Column({ name: 'region_code', type: 'varchar', length: 32 })
  regionCode!: string;

  @Column({ name: 'region_name', type: 'varchar', length: 120, default: '' })
  regionName!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}

@Entity('partner_capabilities')
@Index(['tenantId', 'appPartnerId'], { unique: true })
export class PartnerCapabilityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'app_partner_id', type: 'uuid' })
  appPartnerId!: string;

  @Column({ name: 'pos_setup', type: 'jsonb', default: () => "'{}'" })
  posSetup!: Record<string, unknown>;

  @Column({ name: 'integrations', type: 'jsonb', default: () => "'{}'" })
  integrations!: Record<string, unknown>;

  @Column({ name: 'onboarding', type: 'jsonb', default: () => "'{}'" })
  onboarding!: Record<string, unknown>;

  @Column({ name: 'support', type: 'jsonb', default: () => "'{}'" })
  support!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('partner_users')
@Index(['tenantId', 'email'], { unique: true })
export class PartnerUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'app_partner_id', type: 'uuid' })
  appPartnerId!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 160, default: '' })
  fullName!: string;

  @Column({ name: 'role_title', type: 'varchar', length: 120, default: '' })
  roleTitle!: string;

  @Column({ name: 'portal_password_hash', type: 'varchar', length: 255 })
  portalPasswordHash!: string;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('partner_applications')
@Index(['tenantId', 'appPartnerId'], { unique: true })
export class PartnerApplicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'app_partner_id', type: 'uuid' })
  appPartnerId!: string;

  @Column({ type: 'varchar', length: 32, default: 'submitted' })
  status!: string;

  @Column({ name: 'submitted_at', type: 'timestamptz', default: () => 'NOW()' })
  submittedAt!: Date;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('partner_verification_checks')
@Index(['tenantId', 'applicationId', 'checkKey'], { unique: true })
export class PartnerVerificationCheckEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId!: string;

  @Column({ name: 'check_key', type: 'varchar', length: 64 })
  checkKey!: string;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  result!: Record<string, unknown>;

  @Column({ name: 'performed_at', type: 'timestamptz', nullable: true })
  performedAt!: Date | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}

@Entity('partner_cert_training_modules')
@Index(['tenantId', 'moduleKey'], { unique: true })
export class PartnerCertTrainingModuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'module_key', type: 'varchar', length: 64 })
  moduleKey!: string;

  @Column({ type: 'varchar', length: 180 })
  title!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  content!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('partner_training_progress')
@Index(['tenantId', 'appPartnerId', 'moduleId'], { unique: true })
export class PartnerTrainingProgressEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'app_partner_id', type: 'uuid' })
  appPartnerId!: string;

  @Column({ name: 'module_id', type: 'uuid' })
  moduleId!: string;

  @Column({ name: 'progress_percent', type: 'int', default: 0 })
  progressPercent!: number;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('partner_approvals')
@Index(['tenantId', 'applicationId'])
export class PartnerApprovalEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'application_id', type: 'uuid' })
  applicationId!: string;

  @Column({ type: 'varchar', length: 32, default: 'approved' })
  status!: string;

  @Column({ name: 'approved_by_user_id', type: 'uuid', nullable: true })
  approvedByUserId!: string | null;

  @Column({ type: 'text', default: '' })
  comment!: string;

  @Column({ name: 'decided_at', type: 'timestamptz', default: () => 'NOW()' })
  decidedAt!: Date;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('partner_client_tenants')
@Index(['tenantId', 'appPartnerId', 'clientTenantId'], { unique: true })
export class PartnerClientTenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'app_partner_id', type: 'uuid' })
  appPartnerId!: string;

  @Column({ name: 'client_tenant_id', type: 'uuid' })
  clientTenantId!: string;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status!: string;

  @Column({ name: 'allowed_region_codes', type: 'jsonb', default: () => `'[]'` })
  allowedRegionCodes!: string[];

  @Column({ name: 'sla', type: 'jsonb', default: () => `'{}'` })
  sla!: Record<string, unknown>;

  @Column({ name: 'provision_state', type: 'varchar', length: 32, default: 'linked' })
  provisionState!: string;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('partner_marketplace_categories')
@Index(['tenantId', 'categoryKey'], { unique: true })
export class PartnerMarketplaceCategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'category_key', type: 'varchar', length: 64 })
  categoryKey!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 180 })
  displayName!: string;

  @Column({ name: 'is_global', type: 'boolean', default: true })
  isGlobal!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('partner_marketplace_items')
@Index(['tenantId', 'appPartnerId'])
@Index(['tenantId', 'status'])
export class PartnerMarketplaceItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'app_partner_id', type: 'uuid' })
  appPartnerId!: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId!: string | null;

  @Column({ name: 'item_type', type: 'varchar', length: 32, default: 'integration' })
  itemType!: string;

  @Column({ type: 'varchar', length: 180 })
  name!: string;

  @Column({ type: 'varchar', length: 220 })
  slug!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'varchar', length: 32, default: 'submitted' })
  status!: string;

  @Column({ name: 'region_codes', type: 'jsonb', default: () => `'[]'` })
  regionCodes!: string[];

  @Column({ name: 'linked_app_id', type: 'uuid', nullable: true })
  linkedAppId!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('partner_commission_records')
@Index(['tenantId', 'appPartnerId', 'periodEnd'])
export class PartnerCommissionRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'app_partner_id', type: 'uuid' })
  appPartnerId!: string;

  @Column({ name: 'client_tenant_id', type: 'uuid' })
  clientTenantId!: string;

  @Column({ name: 'period_start', type: 'timestamptz' })
  periodStart!: Date;

  @Column({ name: 'period_end', type: 'timestamptz' })
  periodEnd!: Date;

  @Column({ name: 'amount_cents', type: 'int' })
  amountCents!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: string;

  @Column({ name: 'source_type', type: 'varchar', length: 64, default: 'app_store_billing' })
  sourceType!: string;

  @Column({ name: 'source_ref_id', type: 'uuid', nullable: true })
  sourceRefId!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('partner_payout_reports')
@Index(['tenantId', 'appPartnerId'])
export class PartnerPayoutReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'app_partner_id', type: 'uuid' })
  appPartnerId!: string;

  @Column({ name: 'period_start', type: 'timestamptz' })
  periodStart!: Date;

  @Column({ name: 'period_end', type: 'timestamptz' })
  periodEnd!: Date;

  @Column({ name: 'total_amount_cents', type: 'int' })
  totalAmountCents!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status!: string;

  @Column({ name: 'payout_date', type: 'timestamptz', nullable: true })
  payoutDate!: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}

@Entity('partner_referrals')
@Index(['tenantId', 'referralCode'], { unique: true })
export class PartnerReferralEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'referrer_app_partner_id', type: 'uuid', nullable: true })
  referrerAppPartnerId!: string | null;

  @Column({ name: 'referral_code', type: 'varchar', length: 64 })
  referralCode!: string;

  @Column({ name: 'referred_app_partner_id', type: 'uuid', nullable: true })
  referredAppPartnerId!: string | null;

  @Column({ name: 'referred_client_tenant_id', type: 'uuid', nullable: true })
  referredClientTenantId!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}

@Entity('partner_support_tickets')
@Index(['tenantId', 'appPartnerId'])
@Index(['tenantId', 'clientTenantId'])
export class PartnerSupportTicketEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'app_partner_id', type: 'uuid' })
  appPartnerId!: string;

  @Column({ name: 'client_tenant_id', type: 'uuid', nullable: true })
  clientTenantId!: string | null;

  @Column({ type: 'varchar', length: 32, default: 'open' })
  status!: string;

  @Column({ type: 'varchar', length: 64, default: 'general' })
  category!: string;

  @Column({ type: 'varchar', length: 180, default: '' })
  subject!: string;

  @Column({ type: 'text', default: '' })
  message!: string;

  @Column({ type: 'varchar', length: 32, default: 'medium' })
  priority!: string;

  @Column({ name: 'created_by_partner_user_id', type: 'uuid', nullable: true })
  createdByPartnerUserId!: string | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt!: Date | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;
}

