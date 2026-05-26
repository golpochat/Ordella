import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { ILike, In, Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { AuditLogService } from '../../audit/services';
import { ApiKeysService } from '../../auth/services';
import { WebhooksService } from '../../integrations/services';
import {
  ApproveAppDto,
  CreateReviewDto,
  InstallAppDto,
  MarketplaceQueryDto,
  MeterUsageDto,
  RegisterPartnerDto,
  SubmitAppDto,
  SubmitVersionDto,
} from '../dto';
import {
  AppBillingRecordEntity,
  AppInstallationEntity,
  AppPartnerEntity,
  AppReviewEntity,
  AppVersionEntity,
  MarketplaceAppEntity,
} from '../entities';

const SEED_APPS = [
  {
    name: 'Xero Accounting Sync',
    description: 'Sync sales, refunds, taxes, payouts, and purchase orders into Xero.',
    provider: 'Xero',
    category: 'accounting',
    pricingModel: 'monthly_subscription',
    priceCents: 4900,
    requestedScopes: ['orders.read', 'orders.write', 'inventory.read'],
    webhookEvents: ['order.created', 'order.updated', 'payment.failed'],
  },
  {
    name: 'QuickBooks Connector',
    description: 'Automate QuickBooks sales, tax, refund, payout, and purchase order sync.',
    provider: 'QuickBooks',
    category: 'accounting',
    pricingModel: 'usage_based',
    priceCents: 2,
    usageUnit: 'orders_processed',
    requestedScopes: ['orders.read', 'customers.read'],
    webhookEvents: ['order.created', 'payment.succeeded'],
  },
  {
    name: 'SAP ERP Sync',
    description: 'Sync products, inventory, suppliers, and purchase orders with SAP.',
    provider: 'SAP',
    category: 'erp',
    pricingModel: 'monthly_subscription',
    priceCents: 9900,
    requestedScopes: ['products.read', 'inventory.read', 'inventory.write'],
    webhookEvents: ['inventory.changed', 'product.updated'],
  },
  {
    name: 'Uber Direct Delivery',
    description: 'Create delivery tasks, track delivery status, assign drivers, and reconcile costs.',
    provider: 'Uber Direct',
    category: 'delivery',
    pricingModel: 'revenue_share',
    revenueShareBps: 250,
    requestedScopes: ['orders.read', 'orders.write', 'locations.read'],
    webhookEvents: ['order.ready', 'delivery.updated'],
  },
  {
    name: 'POS Hardware Pack',
    description: 'Connect receipt printers, barcode scanners, cash drawers, and scales.',
    provider: 'Ordella Hardware',
    category: 'hardware',
    pricingModel: 'one_time',
    priceCents: 19900,
    requestedScopes: ['products.read', 'inventory.read', 'orders.read'],
    webhookEvents: [],
  },
] as const;

@Injectable()
export class AppStoreService {
  constructor(
    @InjectRepository(MarketplaceAppEntity)
    private readonly apps: Repository<MarketplaceAppEntity>,
    @InjectRepository(AppVersionEntity)
    private readonly versions: Repository<AppVersionEntity>,
    @InjectRepository(AppReviewEntity)
    private readonly reviews: Repository<AppReviewEntity>,
    @InjectRepository(AppInstallationEntity)
    private readonly installations: Repository<AppInstallationEntity>,
    @InjectRepository(AppBillingRecordEntity)
    private readonly billingRecords: Repository<AppBillingRecordEntity>,
    @InjectRepository(AppPartnerEntity)
    private readonly partners: Repository<AppPartnerEntity>,
    private readonly apiKeys: ApiKeysService,
    private readonly webhooks: WebhooksService,
    private readonly auditLogs: AuditLogService,
  ) {}

  async marketplace(tenant: TenantContext, query: MarketplaceQueryDto) {
    await this.ensureSeedApps();
    const where = {
      status: 'approved' as const,
      ...(query.category ? { category: query.category } : {}),
      ...(query.search ? { name: ILike(`%${query.search}%`) } : {}),
    };
    const apps = await this.apps.find({ where, order: { name: 'ASC' } });
    const [installations, reviewStats] = await Promise.all([
      this.installations.find({ where: { tenantId: tenant.tenantId } }),
      this.reviewStats(apps.map((app) => app.id)),
    ]);
    const installed = new Map(installations.map((installation) => [installation.appId, installation]));
    return apps.map((app) => ({
      ...this.appDto(app, reviewStats.get(app.id)),
      installation: installed.get(app.id) ?? null,
    }));
  }

  async appDetails(tenant: TenantContext, id: string) {
    await this.ensureSeedApps();
    const app = await this.requireApp(id);
    const [versions, reviews, installation] = await Promise.all([
      this.versions.find({ where: { appId: id }, order: { createdAt: 'DESC' } }),
      this.reviews.find({ where: { appId: id, status: 'published' }, order: { createdAt: 'DESC' }, take: 25 }),
      this.installations.findOne({ where: { tenantId: tenant.tenantId, appId: id } }),
    ]);
    const stats = await this.reviewStats([id]);
    return {
      ...this.appDto(app, stats.get(id)),
      versions,
      reviews,
      installation,
    };
  }

  async registerPartner(tenant: TenantContext, dto: RegisterPartnerDto, user?: AuthenticatedUser) {
    const existing = await this.partners.findOne({ where: { tenantId: tenant.tenantId, email: dto.email.toLowerCase() } });
    if (existing) return existing;
    const partner = await this.partners.save(this.partners.create({
      tenantId: tenant.tenantId,
      companyName: dto.companyName.trim(),
      contactName: dto.contactName.trim(),
      email: dto.email.toLowerCase(),
      status: 'sandbox',
      sandboxEnabled: true,
      metadata: {},
    }));
    await this.audit(tenant, user, 'app_store.partner_registered', 'app_partner', partner.id, { companyName: partner.companyName });
    return partner;
  }

  async submitApp(tenant: TenantContext, dto: SubmitAppDto, user?: AuthenticatedUser) {
    const clientSecret = randomBytes(24).toString('base64url');
    const app = await this.apps.save(this.apps.create({
      partnerId: dto.partnerId ?? null,
      name: dto.name.trim(),
      slug: this.slugify(dto.name),
      description: dto.description.trim(),
      provider: dto.provider.trim(),
      category: dto.category,
      pricingModel: dto.pricingModel,
      priceCents: dto.priceCents ?? 0,
      usageUnit: dto.usageUnit ?? null,
      revenueShareBps: dto.revenueShareBps ?? 0,
      status: 'submitted',
      requestedScopes: dto.requestedScopes ?? [],
      webhookEvents: dto.webhookEvents ?? [],
      rateLimitPerMinute: 1000,
      iconUrl: null,
      screenshots: [],
      docsUrl: dto.docsUrl ?? null,
      oauthRedirectUrls: [],
      clientId: `app_${randomBytes(8).toString('hex')}`,
      clientSecretHash: this.hashSecret(clientSecret),
    }));
    await this.versions.save(this.versions.create({
      appId: app.id,
      version: '1.0.0',
      changelog: 'Initial submission',
      manifest: { scopes: app.requestedScopes, webhooks: app.webhookEvents, sandbox: true },
      status: 'submitted',
    }));
    await this.audit(tenant, user, 'app_store.app_submitted', 'marketplace_app', app.id, { appName: app.name });
    return { ...this.appDto(app), clientSecret };
  }

  async approveApp(tenant: TenantContext, id: string, dto: ApproveAppDto, user?: AuthenticatedUser) {
    const app = await this.requireApp(id);
    app.status = dto.status;
    app.updatedAt = new Date();
    const saved = await this.apps.save(app);
    await this.versions.update({ appId: id, status: 'submitted' }, { status: dto.status === 'approved' ? 'approved' : 'rejected' });
    await this.audit(tenant, user, 'app_store.app_reviewed', 'marketplace_app', id, { status: dto.status });
    return this.appDto(saved);
  }

  async submitVersion(tenant: TenantContext, appId: string, dto: SubmitVersionDto, user?: AuthenticatedUser) {
    await this.requireApp(appId);
    const version = await this.versions.save(this.versions.create({
      appId,
      version: dto.version,
      changelog: dto.changelog ?? null,
      manifest: dto.manifest ?? {},
      status: 'submitted',
    }));
    await this.audit(tenant, user, 'app_store.version_submitted', 'marketplace_app', appId, { version: dto.version });
    return version;
  }

  async install(tenant: TenantContext, appId: string, dto: InstallAppDto, user?: AuthenticatedUser) {
    const app = await this.requireApprovedApp(appId);
    const scopes = this.grantedScopes(app, dto.grantedScopes);
    const webhookEvents = this.grantedWebhooks(app, dto.webhookEvents);
    const apiKey = await this.apiKeys.create(tenant, {
      name: `${app.name} app key`,
      scopes,
      rateLimitPerMinute: app.rateLimitPerMinute,
      ipAllowlist: [],
    });
    const webhook = dto.webhookUrl
      ? await this.webhooks.create(tenant, { url: dto.webhookUrl, events: webhookEvents })
      : null;
    const existing = await this.installations.findOne({ where: { tenantId: tenant.tenantId, appId } });
    const installation = existing ?? this.installations.create({ tenantId: tenant.tenantId, appId });
    installation.installedByUserId = user?.id ?? null;
    installation.status = app.status === 'sandbox' ? 'sandbox' : 'installed';
    installation.grantedScopes = scopes;
    installation.webhookEvents = webhookEvents;
    installation.apiKeyId = apiKey.id;
    installation.webhookId = webhook?.id ?? null;
    installation.oauthClientId = app.clientId;
    installation.rateLimitPerMinute = app.rateLimitPerMinute;
    installation.billingStatus = app.pricingModel === 'free' ? 'free' : 'active';
    installation.billingCycleAnchor = app.pricingModel === 'monthly_subscription' ? new Date() : null;
    installation.usageCounters = {};
    installation.consentSnapshot = {
      appName: app.name,
      scopes,
      webhookEvents,
      pricingModel: app.pricingModel,
      priceCents: app.priceCents,
      revenueShareBps: app.revenueShareBps,
      apiKeyPrefix: apiKey.keyPrefix,
      webhookId: webhook?.id ?? null,
    };
    installation.uninstalledAt = null;
    const saved = await this.installations.save(installation);
    await this.createInstallBilling(app, saved);
    await this.audit(tenant, user, 'app_store.app_installed', 'app_installation', saved.id, {
      appId,
      appName: app.name,
      scopes,
      webhookEvents,
      pricingModel: app.pricingModel,
    });
    return { installation: saved, apiKey: apiKey.key, webhookSecret: webhook?.secret ?? null };
  }

  async uninstall(tenant: TenantContext, installationId: string, user?: AuthenticatedUser) {
    const installation = await this.requireInstallation(tenant.tenantId, installationId);
    installation.status = 'uninstalled';
    installation.uninstalledAt = new Date();
    installation.billingStatus = 'cancelled';
    await this.installations.save(installation);
    await this.audit(tenant, user, 'app_store.app_uninstalled', 'app_installation', installation.id, { appId: installation.appId });
  }

  async review(tenant: TenantContext, appId: string, dto: CreateReviewDto, user?: AuthenticatedUser) {
    await this.requireApp(appId);
    const review = await this.reviews.save(this.reviews.create({
      tenantId: tenant.tenantId,
      appId,
      userId: user?.id ?? null,
      rating: dto.rating,
      comment: dto.comment ?? null,
      status: 'published',
    }));
    await this.audit(tenant, user, 'app_store.review_created', 'app_review', review.id, { appId, rating: dto.rating });
    return review;
  }

  async meterUsage(tenant: TenantContext, installationId: string, dto: MeterUsageDto, user?: AuthenticatedUser) {
    const installation = await this.requireInstallation(tenant.tenantId, installationId);
    const app = await this.requireApp(installation.appId);
    const counters = installation.usageCounters ?? {};
    counters[dto.metric] = (counters[dto.metric] ?? 0) + dto.quantity;
    installation.usageCounters = counters;
    await this.installations.save(installation);
    const amountCents = this.usageAmountCents(app, dto);
    const record = await this.billingRecords.save(this.billingRecords.create({
      tenantId: tenant.tenantId,
      appId: app.id,
      installationId: installation.id,
      partnerId: app.partnerId,
      recordType: app.pricingModel === 'revenue_share' ? 'revenue_share' : 'usage',
      amountCents,
      currency: 'USD',
      quantity: dto.quantity,
      status: 'pending',
      metadata: { metric: dto.metric, pricingModel: app.pricingModel },
    }));
    await this.audit(tenant, user, 'app_store.usage_metered', 'app_installation', installation.id, { metric: dto.metric, quantity: dto.quantity, amountCents });
    return record;
  }

  async analytics(tenant: TenantContext) {
    await this.ensureSeedApps();
    const [apps, installations, billing, reviews] = await Promise.all([
      this.apps.find(),
      this.installations.find({ where: { tenantId: tenant.tenantId } }),
      this.billingRecords.find({ where: { tenantId: tenant.tenantId } }),
      this.reviews.find(),
    ]);
    const installsByApp = new Map<string, number>();
    for (const installation of installations) installsByApp.set(installation.appId, (installsByApp.get(installation.appId) ?? 0) + 1);
    const revenueByApp = new Map<string, number>();
    for (const record of billing) revenueByApp.set(record.appId, (revenueByApp.get(record.appId) ?? 0) + record.amountCents);
    const ratingByApp = await this.reviewStats(apps.map((app) => app.id));
    const topApps = apps
      .map((app) => ({
        id: app.id,
        name: app.name,
        category: app.category,
        installs: installsByApp.get(app.id) ?? 0,
        revenueCents: revenueByApp.get(app.id) ?? 0,
        rating: ratingByApp.get(app.id)?.averageRating ?? 0,
      }))
      .sort((a, b) => b.installs - a.installs)
      .slice(0, 10);
    const partnerEarnings = billing.reduce((sum, record) => sum + record.amountCents, 0);
    return {
      topApps,
      installTrends: installations.map((installation) => ({ appId: installation.appId, installedAt: installation.installedAt, status: installation.status })),
      revenuePerApp: topApps.map((app) => ({ appId: app.id, appName: app.name, revenueCents: app.revenueCents })),
      partnerEarningsCents: partnerEarnings,
      reviewCount: reviews.length,
    };
  }

  async partnerDashboard(tenant: TenantContext, partnerId?: string) {
    const partner = partnerId
      ? await this.partners.findOne({ where: { id: partnerId, tenantId: tenant.tenantId } })
      : await this.partners.findOne({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' } });
    if (!partner) return { partner: null, apps: [], installs: 0, revenueCents: 0, reviews: 0 };
    const apps = await this.apps.find({ where: { partnerId: partner.id }, order: { createdAt: 'DESC' } });
    const appIds = apps.map((app) => app.id);
    const [installs, billing, reviews] = appIds.length
      ? await Promise.all([
        this.installations.count({ where: { appId: In(appIds) } }),
        this.billingRecords.find({ where: { partnerId: partner.id } }),
        this.reviews.count({ where: { appId: In(appIds) } }),
      ])
      : [0, [], 0] as const;
    return {
      partner,
      apps: apps.map((app) => this.appDto(app)),
      installs,
      revenueCents: billing.reduce((sum, record) => sum + record.amountCents, 0),
      reviews,
    };
  }

  private async ensureSeedApps(): Promise<void> {
    for (const seed of SEED_APPS) {
      const slug = this.slugify(seed.name);
      const existing = await this.apps.findOne({ where: { slug } });
      if (existing) continue;
      const app = await this.apps.save(this.apps.create({
        name: seed.name,
        description: seed.description,
        provider: seed.provider,
        category: seed.category,
        pricingModel: seed.pricingModel,
        priceCents: 'priceCents' in seed ? seed.priceCents : 0,
        requestedScopes: [...seed.requestedScopes],
        webhookEvents: [...seed.webhookEvents],
        slug,
        partnerId: null,
        status: 'approved',
        usageUnit: 'usageUnit' in seed ? seed.usageUnit ?? null : null,
        revenueShareBps: 'revenueShareBps' in seed ? seed.revenueShareBps ?? 0 : 0,
        rateLimitPerMinute: 1000,
        iconUrl: null,
        screenshots: [],
        docsUrl: null,
        oauthRedirectUrls: [],
        clientId: `app_${randomBytes(8).toString('hex')}`,
        clientSecretHash: this.hashSecret(randomBytes(24).toString('base64url')),
      }));
      await this.versions.save(this.versions.create({
        appId: app.id,
        version: '1.0.0',
        changelog: 'Initial marketplace release',
        manifest: { scopes: app.requestedScopes, webhooks: app.webhookEvents, pricingModel: app.pricingModel },
        status: 'approved',
      }));
    }
  }

  private async createInstallBilling(app: MarketplaceAppEntity, installation: AppInstallationEntity): Promise<void> {
    if (app.pricingModel === 'free') return;
    const recordType = app.pricingModel === 'one_time'
      ? 'one_time'
      : app.pricingModel === 'monthly_subscription'
        ? 'subscription'
        : app.pricingModel === 'revenue_share'
          ? 'revenue_share'
          : 'usage';
    await this.billingRecords.save(this.billingRecords.create({
      tenantId: installation.tenantId,
      appId: app.id,
      installationId: installation.id,
      partnerId: app.partnerId,
      recordType,
      amountCents: app.pricingModel === 'usage_based' || app.pricingModel === 'revenue_share' ? 0 : app.priceCents,
      currency: 'USD',
      quantity: 1,
      status: 'pending',
      metadata: { pricingModel: app.pricingModel, billingStatus: installation.billingStatus },
    }));
  }

  private usageAmountCents(app: MarketplaceAppEntity, dto: MeterUsageDto): number {
    if (app.pricingModel === 'usage_based') return app.priceCents * dto.quantity;
    if (app.pricingModel === 'revenue_share' && dto.metric === 'sales_cents') return Math.round((dto.quantity * app.revenueShareBps) / 10000);
    return 0;
  }

  private grantedScopes(app: MarketplaceAppEntity, requested?: string[]): string[] {
    const requestedScopes = requested?.length ? requested : app.requestedScopes;
    const invalid = requestedScopes.filter((scope) => !app.requestedScopes.includes(scope));
    if (invalid.length) throw new BadRequestException(`App did not request scopes: ${invalid.join(', ')}`);
    return requestedScopes;
  }

  private grantedWebhooks(app: MarketplaceAppEntity, requested?: string[]): string[] {
    const events = requested?.length ? requested : app.webhookEvents;
    const invalid = events.filter((event) => !app.webhookEvents.includes(event));
    if (invalid.length) throw new BadRequestException(`App did not request webhook events: ${invalid.join(', ')}`);
    return events;
  }

  private async requireApprovedApp(id: string): Promise<MarketplaceAppEntity> {
    const app = await this.requireApp(id);
    if (!['approved', 'sandbox'].includes(app.status)) throw new BadRequestException('App is not approved for installation');
    return app;
  }

  private async requireApp(id: string): Promise<MarketplaceAppEntity> {
    const app = await this.apps.findOne({ where: { id } });
    if (!app) throw new NotFoundException('App not found');
    return app;
  }

  private async requireInstallation(tenantId: string, id: string): Promise<AppInstallationEntity> {
    const installation = await this.installations.findOne({ where: { id, tenantId } });
    if (!installation) throw new NotFoundException('App installation not found');
    return installation;
  }

  private async reviewStats(appIds: string[]): Promise<Map<string, { averageRating: number; reviewCount: number }>> {
    if (!appIds.length) return new Map();
    const rows = await this.reviews
      .createQueryBuilder('review')
      .select('review.app_id', 'appId')
      .addSelect('COUNT(*)', 'reviewCount')
      .addSelect('AVG(review.rating)', 'averageRating')
      .where('review.app_id IN (:...appIds)', { appIds })
      .andWhere('review.status = :status', { status: 'published' })
      .groupBy('review.app_id')
      .getRawMany<{ appId: string; reviewCount: string; averageRating: string }>();
    return new Map(rows.map((row) => [row.appId, { reviewCount: Number(row.reviewCount), averageRating: Number(row.averageRating) }]));
  }

  private appDto(app: MarketplaceAppEntity, stats?: { averageRating: number; reviewCount: number }) {
    return {
      id: app.id,
      partnerId: app.partnerId,
      name: app.name,
      slug: app.slug,
      description: app.description,
      provider: app.provider,
      category: app.category,
      pricingModel: app.pricingModel,
      priceCents: app.priceCents,
      usageUnit: app.usageUnit,
      revenueShareBps: app.revenueShareBps,
      status: app.status,
      requestedScopes: app.requestedScopes,
      webhookEvents: app.webhookEvents,
      rateLimitPerMinute: app.rateLimitPerMinute,
      iconUrl: app.iconUrl,
      screenshots: app.screenshots,
      docsUrl: app.docsUrl,
      oauthClientId: app.clientId,
      averageRating: stats?.averageRating ?? 0,
      reviewCount: stats?.reviewCount ?? 0,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  }

  private async audit(tenant: TenantContext, user: AuthenticatedUser | undefined, action: string, entityType: string, entityId: string, metadata: Record<string, unknown>) {
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id ?? null,
      action,
      entityType,
      entityId,
      source: 'admin_ui',
      riskLevel: action.includes('installed') || action.includes('uninstalled') ? 'high' : 'medium',
      metadata,
    });
  }

  private hashSecret(secret: string): string {
    return createHash('sha256').update(secret).digest('hex');
  }

  private slugify(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `app-${Date.now()}`;
  }
}
