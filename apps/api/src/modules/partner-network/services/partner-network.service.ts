import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { In, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { AppPartnerEntity, AppInstallationEntity, AppBillingRecordEntity, AppReviewEntity, MarketplaceAppEntity } from '../../app-store/entities';
import { TenantContext, AuthenticatedUser } from '../../../common/interfaces';
import { AuditLogService } from '../../audit/services';
import { AppStoreService } from '../../app-store/services/app-store.service';
import { hashPassword, verifyPassword } from '../../onboarding/utils/password.util';
import {
  PartnerCertTrainingModuleEntity,
  PartnerClientTenantEntity,
  PartnerMarketplaceCategoryEntity,
  PartnerMarketplaceItemEntity,
  PartnerProfileEntity,
  PartnerRegionEntity,
  PartnerTierEntity,
  PartnerUserEntity,
  PartnerApplicationEntity,
  PartnerVerificationCheckEntity,
  PartnerTrainingProgressEntity,
  PartnerApprovalEntity,
  PartnerCommissionRecordEntity,
  PartnerPayoutReportEntity,
  PartnerReferralEntity,
  PartnerSupportTicketEntity,
  PartnerCapabilityEntity,
} from '../entities';
import {
  ApprovePartnerApplicationDto,
  CreateMarketplaceItemDto,
  InstallAppOnBehalfDto,
  LinkClientTenantDto,
  MarketplaceQueryDto,
  PartnerPortalLoginDto,
  SubmitCommissionPayoutDto,
  SubmitPartnerApplicationDto,
  UpdatePartnerTrainingProgressDto,
  UpdatePartnerVerificationDto,
  CreatePartnerSupportTicketDto,
  CreatePartnerPortalUserDto,
} from '../dto';
import { PartnerAuthPayload } from '../types/partner-auth-payload';

const DEFAULT_TIERS: Array<{ tierKey: string; displayName: string; commissionRateBps: number; resellerPricingDiscountBps: number }> = [
  { tierKey: 'silver', displayName: 'Silver', commissionRateBps: 1500, resellerPricingDiscountBps: 1000 },
  { tierKey: 'gold', displayName: 'Gold', commissionRateBps: 2000, resellerPricingDiscountBps: 1500 },
  { tierKey: 'platinum', displayName: 'Platinum', commissionRateBps: 2500, resellerPricingDiscountBps: 2000 },
];

const DEFAULT_MARKETPLACE_CATEGORIES: Array<{ categoryKey: string; displayName: string }> = [
  { categoryKey: 'pos', displayName: 'POS' },
  { categoryKey: 'erp', displayName: 'ERP' },
  { categoryKey: 'delivery', displayName: 'Delivery' },
  { categoryKey: 'analytics', displayName: 'Analytics' },
  { categoryKey: 'iot', displayName: 'IoT' },
];

@Injectable()
export class PartnerNetworkService {
  constructor(
    @InjectRepository(PartnerTierEntity)
    private readonly tiers: Repository<PartnerTierEntity>,
    @InjectRepository(PartnerProfileEntity)
    private readonly profiles: Repository<PartnerProfileEntity>,
    @InjectRepository(PartnerRegionEntity)
    private readonly regions: Repository<PartnerRegionEntity>,
    @InjectRepository(PartnerCapabilityEntity)
    private readonly capabilities: Repository<PartnerCapabilityEntity>,
    @InjectRepository(PartnerUserEntity)
    private readonly users: Repository<PartnerUserEntity>,
    @InjectRepository(PartnerApplicationEntity)
    private readonly applications: Repository<PartnerApplicationEntity>,
    @InjectRepository(PartnerVerificationCheckEntity)
    private readonly verificationChecks: Repository<PartnerVerificationCheckEntity>,
    @InjectRepository(PartnerCertTrainingModuleEntity)
    private readonly trainingModules: Repository<PartnerCertTrainingModuleEntity>,
    @InjectRepository(PartnerTrainingProgressEntity)
    private readonly trainingProgress: Repository<PartnerTrainingProgressEntity>,
    @InjectRepository(PartnerApprovalEntity)
    private readonly approvals: Repository<PartnerApprovalEntity>,
    @InjectRepository(PartnerClientTenantEntity)
    private readonly clientTenants: Repository<PartnerClientTenantEntity>,
    @InjectRepository(PartnerMarketplaceCategoryEntity)
    private readonly marketplaceCategories: Repository<PartnerMarketplaceCategoryEntity>,
    @InjectRepository(PartnerMarketplaceItemEntity)
    private readonly marketplaceItems: Repository<PartnerMarketplaceItemEntity>,
    @InjectRepository(PartnerCommissionRecordEntity)
    private readonly commissionRecords: Repository<PartnerCommissionRecordEntity>,
    @InjectRepository(PartnerPayoutReportEntity)
    private readonly payoutReports: Repository<PartnerPayoutReportEntity>,
    @InjectRepository(PartnerReferralEntity)
    private readonly referrals: Repository<PartnerReferralEntity>,
    @InjectRepository(PartnerSupportTicketEntity)
    private readonly supportTickets: Repository<PartnerSupportTicketEntity>,
    @InjectRepository(AppPartnerEntity)
    private readonly appPartners: Repository<AppPartnerEntity>,
    @InjectRepository(MarketplaceAppEntity)
    private readonly marketplaceApps: Repository<MarketplaceAppEntity>,
    @InjectRepository(AppInstallationEntity)
    private readonly appInstallations: Repository<AppInstallationEntity>,
    @InjectRepository(AppBillingRecordEntity)
    private readonly billingRecords: Repository<AppBillingRecordEntity>,
    @InjectRepository(AppReviewEntity)
    private readonly reviews: Repository<AppReviewEntity>,
    private readonly jwtService: JwtService,
    private readonly audit: AuditLogService,
    private readonly appStore: AppStoreService,
  ) {}

  private readonly ensureDefaultsLocks = new Map<string, Promise<void>>();

  async partnerLogin(tenant: TenantContext, dto: PartnerPortalLoginDto) {
    await this.ensureDefaults(tenant);
    const user = await this.users.findOne({
      where: { tenantId: tenant.tenantId, email: dto.email.trim().toLowerCase(), status: 'active' },
    });

    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (!(await verifyPassword(dto.password, user.portalPasswordHash))) throw new UnauthorizedException('Invalid email or password');

    const token = await this.jwtService.signAsync({
      sub: user.id,
      tenantId: tenant.tenantId,
      email: user.email,
      type: 'partner',
      partnerId: user.appPartnerId,
      partnerUserId: user.id,
    });

    await this.audit.record({
      tenantId: tenant.tenantId,
      userId: null,
      actorType: 'partner_staff',
      source: 'partner_portal',
      action: 'partner_network.portal_login',
      entityType: 'partner_user',
      entityId: user.id,
      metadata: { email: user.email, partnerId: user.appPartnerId },
      status: 'success',
    });

    return {
      accessToken: token,
      tokenType: 'Bearer',
      partner: { partnerId: user.appPartnerId, userId: user.id, email: user.email, fullName: user.fullName },
    };
  }

  async submitPartnerApplication(
    tenant: TenantContext,
    partner: PartnerAuthPayload,
    dto: SubmitPartnerApplicationDto,
  ): Promise<PartnerApplicationEntity> {
    await this.ensureDefaults(tenant);
    await this.ensurePartnerProfile(tenant, partner.partnerId);

    const existing = await this.applications.findOne({ where: { tenantId: tenant.tenantId, appPartnerId: partner.partnerId } });
    const app = existing
      ? existing
      : await this.applications.save(
          this.applications.create({
            tenantId: tenant.tenantId,
            appPartnerId: partner.partnerId,
            status: 'submitted',
            metadata: {},
          }),
        );

    app.status = 'submitted';
    app.updatedAt = new Date();
    app.metadata = { ...(app.metadata ?? {}), ...(dto.metadata ?? {}), tierKey: dto.tierKey ?? null, ...dto.certifications };
    await this.applications.save(app);

    const profile = await this.profiles.findOne({ where: { tenantId: tenant.tenantId, appPartnerId: partner.partnerId } });
    if (profile) {
      profile.certifications = dto.certifications ?? {};
      profile.complianceStatus = 'pending';
      if (dto.tierKey) {
        const tier = await this.tiers.findOne({ where: { tenantId: tenant.tenantId, tierKey: dto.tierKey } });
        profile.tierId = tier?.id ?? null;
      }
      profile.updatedAt = new Date();
      await this.profiles.save(profile);
    }

    // Partner region restrictions for the portal
    if (dto.regionCodes?.length) {
      await this.regions.delete({ tenantId: tenant.tenantId, appPartnerId: partner.partnerId });
      await this.regions.save(
        dto.regionCodes.map((code) =>
          this.regions.create({
            tenantId: tenant.tenantId,
            appPartnerId: partner.partnerId,
            regionCode: code,
            regionName: code.toUpperCase(),
          }),
        ),
      );
    }

    // Partner capability profile (POS setup, integrations, onboarding, support)
    if (dto.capabilities && Object.keys(dto.capabilities).length) {
      const cap = dto.capabilities as Record<string, any>;
      const existing = await this.capabilities.findOne({ where: { tenantId: tenant.tenantId, appPartnerId: partner.partnerId } });
      const row: PartnerCapabilityEntity =
        existing ??
        this.capabilities.create({
          tenantId: tenant.tenantId,
          appPartnerId: partner.partnerId,
        });
      row.posSetup = cap.posSetup ?? cap.pos ?? {};
      row.integrations = cap.integrations ?? {};
      row.onboarding = cap.onboarding ?? cap.onboardingSupport ?? {};
      row.support = cap.support ?? cap.supporting ?? {};
      row.isActive = true;
      row.updatedAt = new Date();
      await this.capabilities.save(row);
    }

    await this.audit.record({
      tenantId: tenant.tenantId,
      actorType: 'partner_staff',
      source: 'partner_portal',
      action: 'partner_network.application_submitted',
      entityType: 'partner_application',
      entityId: app.id,
      userId: partner.partnerUserId,
      metadata: { partnerId: partner.partnerId, status: app.status },
      status: 'success',
    });

    return app;
  }

  async updateVerificationCheck(
    tenant: TenantContext,
    partner: PartnerAuthPayload,
    applicationId: string,
    dto: UpdatePartnerVerificationDto,
  ): Promise<PartnerVerificationCheckEntity> {
    const app = await this.requireApplication(tenant, partner.partnerId, applicationId);
    if (!['submitted', 'verification_in_progress'].includes(app.status)) {
      throw new BadRequestException('Application is not in verification state');
    }

    const check =
      (await this.verificationChecks.findOne({ where: { tenantId: tenant.tenantId, applicationId, checkKey: dto.checkKey } })) ??
      (await this.verificationChecks.save(
        this.verificationChecks.create({
          tenantId: tenant.tenantId,
          applicationId,
          checkKey: dto.checkKey,
          status: 'pending',
          result: {},
        }),
      ));

    check.status = dto.status === 'passed' ? 'passed' : 'failed';
    check.result = dto.result ?? { notes: '—' };
    check.performedAt = new Date();
    await this.verificationChecks.save(check);

    app.status = 'verification_in_progress';
    app.updatedAt = new Date();
    await this.applications.save(app);

    return check;
  }

  async updateTrainingProgress(
    tenant: TenantContext,
    partner: PartnerAuthPayload,
    moduleId: string,
    dto: UpdatePartnerTrainingProgressDto,
  ): Promise<PartnerTrainingProgressEntity> {
    await this.ensurePartnerProfile(tenant, partner.partnerId);
    const module = await this.trainingModules.findOne({ where: { tenantId: tenant.tenantId, id: moduleId, isActive: true } });
    if (!module) throw new NotFoundException('Training module not found');

    const existing = await this.trainingProgress.findOne({
      where: { tenantId: tenant.tenantId, appPartnerId: partner.partnerId, moduleId },
    });

    const row = existing
      ? existing
      : await this.trainingProgress.save(
          this.trainingProgress.create({
            tenantId: tenant.tenantId,
            appPartnerId: partner.partnerId,
            moduleId,
          }),
        );

    row.progressPercent = dto.progressPercent;
    row.completedAt = dto.progressPercent >= 100 ? new Date() : null;
    row.updatedAt = new Date();
    await this.trainingProgress.save(row);
    return row;
  }

  async linkClientTenant(tenant: TenantContext, partner: PartnerAuthPayload, dto: LinkClientTenantDto): Promise<PartnerClientTenantEntity> {
    await this.ensurePartnerProfile(tenant, partner.partnerId);
    const row = await this.clientTenants.save(
      this.clientTenants.create({
        tenantId: tenant.tenantId,
        appPartnerId: partner.partnerId,
        clientTenantId: dto.clientTenantId,
        status: 'active',
        allowedRegionCodes: dto.allowedRegionCodes ?? [],
        sla: dto.sla ?? {},
        provisionState: dto.provisionState ?? 'linked',
      }),
    );

    await this.audit.record({
      tenantId: tenant.tenantId,
      actorType: 'partner_staff',
      source: 'partner_portal',
      action: 'partner_network.client_tenant_linked',
      entityType: 'partner_client_tenant',
      entityId: row.id,
      userId: partner.partnerUserId,
      metadata: { partnerId: partner.partnerId, clientTenantId: row.clientTenantId, allowedRegionCodes: row.allowedRegionCodes },
      status: 'success',
    });

    return row;
  }

  async listClientTenants(tenant: TenantContext, partner: PartnerAuthPayload): Promise<PartnerClientTenantEntity[]> {
    return this.clientTenants.find({ where: { tenantId: tenant.tenantId, appPartnerId: partner.partnerId }, order: { createdAt: 'DESC' } });
  }

  async listMarketplaceCategories(tenant: TenantContext) {
    await this.ensureDefaults(tenant);
    return this.marketplaceCategories.find({ where: { tenantId: tenant.tenantId }, order: { displayName: 'ASC' } });
  }

  async listMarketplaceItems(tenant: TenantContext, partner: PartnerAuthPayload | null, query: MarketplaceQueryDto) {
    await this.ensureDefaults(tenant);
    const where: any = { tenantId: tenant.tenantId, status: 'approved' };
    if (partner?.partnerId) where.appPartnerId = partner.partnerId;
    if (query.itemType) where.itemType = query.itemType;

    const all = await this.marketplaceItems.find({ where });
    if (!query.regionCode) return all;
    const regionCode = query.regionCode.toUpperCase();
    return all.filter((item) => item.regionCodes?.length ? item.regionCodes.includes(regionCode) : true);
  }

  async createMarketplaceItem(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: CreateMarketplaceItemDto, partnerId: string): Promise<PartnerMarketplaceItemEntity> {
    await this.ensureDefaults(tenant);
    const slug = `${dto.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (!slug) throw new BadRequestException('Invalid item name');

    const categoryId = dto.categoryId ?? null;
    const item = await this.marketplaceItems.save(
      this.marketplaceItems.create({
        tenantId: tenant.tenantId,
        appPartnerId: partnerId,
        categoryId,
        itemType: dto.itemType,
        name: dto.name.trim(),
        slug: `${slug}-${randomBytes(3).toString('hex')}`,
        description: dto.description ?? '',
        status: 'approved', // MVP: auto-approve
        regionCodes: (dto.regionCodes ?? []).map((r) => r.toUpperCase()),
        linkedAppId: dto.linkedAppId ?? null,
        metadata: dto.metadata ?? {},
      }),
    );

    await this.audit.record({
      tenantId: tenant.tenantId,
      userId: user?.id ?? null,
      actorType: user ? 'staff' : 'system',
      source: 'admin_ui',
      action: 'partner_network.marketplace_item_created',
      entityType: 'partner_marketplace_item',
      entityId: item.id,
      metadata: { partnerId: partnerId, itemType: dto.itemType, categoryId: item.categoryId, linkedAppId: item.linkedAppId },
      status: 'success',
    });

    return item;
  }

  async installAppOnBehalf(
    tenant: TenantContext,
    partner: PartnerAuthPayload,
    clientTenantId: string,
    appId: string,
    dto: InstallAppOnBehalfDto,
  ) {
    await this.ensureDefaults(tenant);
    const access = await this.requireClientTenantAccess(tenant, partner.partnerId, clientTenantId);
    if (dto.regionCode) {
      const region = dto.regionCode.toUpperCase();
      if (access.allowedRegionCodes?.length && !access.allowedRegionCodes.includes(region)) {
        throw new UnauthorizedException('Partner is not authorized for this region');
      }
    }

    const partnerUser: AuthenticatedUser = {
      id: partner.partnerUserId,
      tenantId: tenant.tenantId,
      email: partner.email,
      roleId: 'partner',
      roleName: 'partner' as never,
      permissions: ['*'],
      locationIds: [],
      sessionId: undefined,
    };

    const clientTenantContext: TenantContext = { tenantId: clientTenantId, source: 'header' };
    const result = await this.appStore.install(clientTenantContext, appId, {
      grantedScopes: dto.grantedScopes,
      webhookEvents: dto.webhookEvents,
      webhookUrl: dto.webhookUrl,
    } as any, partnerUser);

    await this.audit.record({
      tenantId: tenant.tenantId,
      actorType: 'partner_staff',
      source: 'partner_portal',
      action: 'partner_network.impersonation_app_install',
      entityType: 'partner_client_tenant',
      entityId: access.id,
      userId: partner.partnerUserId,
      metadata: { partnerId: partner.partnerId, clientTenantId, appId, regionCode: dto.regionCode ?? null },
      status: 'success',
    });

    // Optional referral tracking
    if (dto.referralCode) {
      const existingReferral = await this.referrals.findOne({ where: { tenantId: tenant.tenantId, referralCode: dto.referralCode } });
      if (!existingReferral) {
        await this.referrals.save(
          this.referrals.create({
            tenantId: tenant.tenantId,
            referrerAppPartnerId: partner.partnerId,
            referralCode: dto.referralCode,
            referredClientTenantId: clientTenantId,
            referredAppPartnerId: null,
            metadata: { createdBy: partner.partnerUserId },
          }),
        );
      }
    }

    return result;
  }

  async listPartnerSupportTickets(
    tenant: TenantContext,
    partner: PartnerAuthPayload,
  ): Promise<PartnerSupportTicketEntity[]> {
    return this.supportTickets.find({
      where: { tenantId: tenant.tenantId, appPartnerId: partner.partnerId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async createPartnerSupportTicket(
    tenant: TenantContext,
    partner: PartnerAuthPayload,
    dto: CreatePartnerSupportTicketDto,
  ): Promise<PartnerSupportTicketEntity> {
    await this.ensurePartnerProfile(tenant, partner.partnerId);
    if (dto.clientTenantId) {
      await this.requireClientTenantAccess(tenant, partner.partnerId, dto.clientTenantId);
    }

    const ticket = await this.supportTickets.save(
      this.supportTickets.create({
        tenantId: tenant.tenantId,
        appPartnerId: partner.partnerId,
        clientTenantId: dto.clientTenantId ?? null,
        status: 'open',
        category: dto.category ?? 'general',
        subject: dto.subject.trim(),
        message: dto.message.trim(),
        priority: dto.priority ?? 'medium',
        createdByPartnerUserId: partner.partnerUserId,
        resolvedAt: null,
        metadata: dto.metadata ?? {},
      }),
    );

    await this.audit.record({
      tenantId: tenant.tenantId,
      actorType: 'partner_staff',
      source: 'partner_portal',
      action: 'partner_network.support_ticket_created',
      entityType: 'partner_support_ticket',
      entityId: ticket.id,
      userId: partner.partnerUserId,
      metadata: { partnerId: partner.partnerId, clientTenantId: ticket.clientTenantId, category: ticket.category },
      status: 'success',
    });

    return ticket;
  }

  async partnerAnalytics(tenant: TenantContext, appPartnerId: string) {
    await this.ensureDefaults(tenant);
    // Partner region mapping is currently per-client, but marketplace apps are global in app-store.
    const apps = await this.marketplaceApps.find({ where: { partnerId: appPartnerId } });
    const appIds = apps.map((a) => a.id);
    if (!appIds.length) {
      return { partnerId: appPartnerId, installs: 0, revenueCents: 0, reviewCount: 0, averageRating: 0 };
    }

    const clientTenantIds = (await this.clientTenants.find({ where: { tenantId: tenant.tenantId, appPartnerId } })).map((t) => t.clientTenantId);
    if (!clientTenantIds.length) {
      return { partnerId: appPartnerId, installs: 0, revenueCents: 0, reviewCount: 0, averageRating: 0 };
    }

    const installs = await this.appInstallations.count({ where: { tenantId: In(clientTenantIds), appId: In(appIds) } });
    const revenueCents = (await this.billingRecords.find({ where: { tenantId: In(clientTenantIds), partnerId: appPartnerId } })).reduce((sum, r) => sum + r.amountCents, 0);
    const reviewRows = await this.reviews
      .createQueryBuilder('review')
      .select('COUNT(*)', 'reviewCount')
      .addSelect('AVG(review.rating)', 'averageRating')
      .where('review.tenant_id IN (:...tenantIds)', { tenantIds: clientTenantIds })
      .andWhere('review.app_id IN (:...appIds)', { appIds })
      .andWhere('review.status = :status', { status: 'published' })
      .getRawOne<{ reviewCount: string; averageRating: string }>();

    return {
      partnerId: appPartnerId,
      installs,
      revenueCents,
      reviewCount: Number(reviewRows?.reviewCount ?? 0),
      averageRating: Number(reviewRows?.averageRating ?? 0),
    };
  }

  async generatePartnerCommissionRecords(
    tenant: TenantContext,
    appPartnerId: string,
    period: { periodStart: string; periodEnd: string },
  ) {
    await this.ensureDefaults(tenant);
    const start = new Date(period.periodStart);
    const end = new Date(period.periodEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new BadRequestException('Invalid period');
    if (end <= start) throw new BadRequestException('periodEnd must be after periodStart');

    const profile = await this.profiles.findOne({ where: { tenantId: tenant.tenantId, appPartnerId } });
    if (!profile) throw new NotFoundException('Partner profile not found');
    const tier = profile.tierId ? await this.tiers.findOne({ where: { tenantId: tenant.tenantId, id: profile.tierId } }) : null;
    const commissionRateBps = tier?.commissionRateBps ?? 0;
    const resellerDiscountBps = tier?.resellerPricingDiscountBps ?? 0;

    const clientTenantIds = (await this.clientTenants.find({ where: { tenantId: tenant.tenantId, appPartnerId } })).map((t) => t.clientTenantId);
    if (!clientTenantIds.length) return { created: 0 };

    const billing = await this.billingRecords.find({
      where: {
        tenantId: In(clientTenantIds),
        partnerId: appPartnerId,
      },
    });

    // MVP: create one aggregated record.
    const revenueCents = billing.filter((r) => r.createdAt >= start && r.createdAt <= end).reduce((sum, r) => sum + (r.amountCents ?? 0), 0);
    if (!revenueCents) return { created: 0 };

    const discountedRevenueCents = Math.max(0, Math.round(revenueCents * (1 - resellerDiscountBps / 10000)));
    const commissionAmountCents = Math.round((discountedRevenueCents * commissionRateBps) / 10000);

    const record = await this.commissionRecords.save(
      this.commissionRecords.create({
        tenantId: tenant.tenantId,
        appPartnerId,
        clientTenantId: clientTenantIds[0],
        periodStart: start,
        periodEnd: end,
        amountCents: commissionAmountCents,
        currency: 'USD',
        status: 'pending',
        sourceType: 'app_store_billing',
        sourceRefId: null,
        metadata: { revenueCents, discountedRevenueCents, commissionRateBps, resellerDiscountBps },
      }),
    );

    await this.audit.record({
      tenantId: tenant.tenantId,
      actorType: 'system',
      source: 'partner_portal',
      action: 'partner_network.commissions_generated',
      entityType: 'partner_commission_record',
      entityId: record.id,
      metadata: { appPartnerId, periodStart: start.toISOString(), periodEnd: end.toISOString(), amountCents: commissionAmountCents },
      status: 'success',
    });

    return { created: 1 };
  }

  async createPayoutReport(tenant: TenantContext, appPartnerId: string, dto: SubmitCommissionPayoutDto) {
    await this.ensureDefaults(tenant);
    const start = new Date(dto.periodStart);
    const end = new Date(dto.periodEnd);

    const records = await this.commissionRecords.find({
      where: { tenantId: tenant.tenantId, appPartnerId, periodStart: start, periodEnd: end },
    });
    const total = records.filter((r) => r.status === 'pending').reduce((sum, r) => sum + r.amountCents, 0);
    if (!total) return { report: null };

    const report = await this.payoutReports.save(
      this.payoutReports.create({
        tenantId: tenant.tenantId,
        appPartnerId,
        periodStart: start,
        periodEnd: end,
        totalAmountCents: total,
        currency: 'USD',
        status: 'ready',
        payoutDate: null,
        metadata: {},
      }),
    );

    return { report };
  }

  async listPartnerApplications(tenant: TenantContext, query?: { status?: string }) {
    await this.ensureDefaults(tenant);
    return this.applications.find({
      where: { tenantId: tenant.tenantId, ...(query?.status ? { status: query.status } : {}) },
      order: { submittedAt: 'DESC' },
      take: 50,
    });
  }

  async approveApplication(tenant: TenantContext, adminUser: AuthenticatedUser | undefined, applicationId: string, dto: ApprovePartnerApplicationDto) {
    const app = await this.applications.findOne({ where: { tenantId: tenant.tenantId, id: applicationId } });
    if (!app) throw new NotFoundException('Application not found');

    app.status = dto.status === 'approved' ? 'approved' : 'rejected';
    app.updatedAt = new Date();
    await this.applications.save(app);

    const profile = await this.profiles.findOne({ where: { tenantId: tenant.tenantId, appPartnerId: app.appPartnerId } });
    if (profile) {
      profile.complianceStatus = dto.status;
      profile.sandboxEnabled = dto.status === 'approved';
      profile.updatedAt = new Date();
      await this.profiles.save(profile);
    }

    // Sync sandbox status in app-store partner record so marketplace installs behave correctly.
    await this.appPartners.update(
      { tenantId: tenant.tenantId, id: app.appPartnerId },
      { status: dto.status === 'approved' ? 'approved' : 'rejected', sandboxEnabled: dto.status === 'approved' },
    );

    await this.approvals.save(
      this.approvals.create({
        tenantId: tenant.tenantId,
        applicationId: app.id,
        status: dto.status === 'approved' ? 'approved' : 'rejected',
        approvedByUserId: adminUser?.id ?? null,
        comment: dto.comment ?? '',
        decidedAt: new Date(),
      }),
    );

    await this.audit.record({
      tenantId: tenant.tenantId,
      actorType: 'staff',
      source: 'admin_ui',
      action: 'partner_network.application_decided',
      entityType: 'partner_application',
      entityId: app.id,
      userId: adminUser?.id ?? null,
      metadata: { partnerId: app.appPartnerId, status: app.status },
      status: 'success',
    });

    return app;
  }

  async createPartnerPortalUser(
    tenant: TenantContext,
    adminUser: AuthenticatedUser | undefined,
    appPartnerId: string,
    dto: CreatePartnerPortalUserDto,
  ): Promise<Omit<PartnerUserEntity, 'portalPasswordHash'>> {
    await this.ensureDefaults(tenant);
    const partner = await this.appPartners.findOne({ where: { tenantId: tenant.tenantId, id: appPartnerId } });
    if (!partner) throw new NotFoundException('Partner not found');

    const existing = await this.users.findOne({ where: { tenantId: tenant.tenantId, email: dto.email.trim().toLowerCase() } });
    if (existing) throw new BadRequestException('User already exists');

    const hashed = await hashPassword(dto.password);
    const user = await this.users.save(
      this.users.create({
        tenantId: tenant.tenantId,
        appPartnerId,
        email: dto.email.trim().toLowerCase(),
        fullName: dto.fullName?.trim() ?? '',
        roleTitle: dto.roleTitle?.trim() ?? '',
        portalPasswordHash: hashed,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    await this.audit.record({
      tenantId: tenant.tenantId,
      userId: adminUser?.id ?? null,
      actorType: 'staff',
      source: 'admin_ui',
      action: 'partner_network.portal_user_created',
      entityType: 'partner_user',
      entityId: user.id,
      metadata: { partnerId: appPartnerId, email: user.email },
      status: 'success',
    });

    // Avoid leaking portal password hash back to callers.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { portalPasswordHash: _ignored, ...safe } = user;
    return safe;
  }

  private ensureDefaults(tenant: TenantContext): Promise<void> {
    const tenantId = tenant.tenantId;
    const inFlight = this.ensureDefaultsLocks.get(tenantId);
    if (inFlight) return inFlight;

    const run = this.seedDefaults(tenant).finally(() => {
      if (this.ensureDefaultsLocks.get(tenantId) === run) {
        this.ensureDefaultsLocks.delete(tenantId);
      }
    });
    this.ensureDefaultsLocks.set(tenantId, run);
    return run;
  }

  private async seedDefaults(tenant: TenantContext) {
    // Tiers
    for (const tier of DEFAULT_TIERS) {
      const existing = await this.tiers.findOne({ where: { tenantId: tenant.tenantId, tierKey: tier.tierKey } });
      if (!existing) {
        await this.tiers.save(
          this.tiers.create({
            tenantId: tenant.tenantId,
            tierKey: tier.tierKey,
            displayName: tier.displayName,
            commissionRateBps: tier.commissionRateBps,
            resellerPricingDiscountBps: tier.resellerPricingDiscountBps,
            isActive: true,
          }),
        );
      }
    }
    // Marketplace categories
    for (const category of DEFAULT_MARKETPLACE_CATEGORIES) {
      const existing = await this.marketplaceCategories.findOne({ where: { tenantId: tenant.tenantId, categoryKey: category.categoryKey } });
      if (!existing) {
        await this.marketplaceCategories.save(
          this.marketplaceCategories.create({
            tenantId: tenant.tenantId,
            categoryKey: category.categoryKey,
            displayName: category.displayName,
            isGlobal: true,
            metadata: {},
          }),
        );
      }
    }

    // Training modules are tenant-scoped definitions.
    const seedModules: Array<{ moduleKey: string; title: string; description: string }> = [
      { moduleKey: 'cert-pos', title: 'POS Integration Certification', description: 'Hands-on POS setup and validation' },
      { moduleKey: 'cert-integration', title: 'Enterprise Integration Certification', description: 'Validate ERP/POS integration workflows' },
      { moduleKey: 'cert-iot', title: 'IoT Hardware Certification', description: 'Device enrollment and telemetry reliability' },
    ];
    for (const mod of seedModules) {
      const existing = await this.trainingModules.findOne({ where: { tenantId: tenant.tenantId, moduleKey: mod.moduleKey } });
      if (!existing) {
        await this.trainingModules.save(
          this.trainingModules.create({
            tenantId: tenant.tenantId,
            moduleKey: mod.moduleKey,
            title: mod.title,
            description: mod.description,
            content: { phases: [] },
            isActive: true,
          }),
        );
      }
    }
  }

  private async ensurePartnerProfile(tenant: TenantContext, appPartnerId: string) {
    const existing = await this.profiles.findOne({ where: { tenantId: tenant.tenantId, appPartnerId } });
    if (existing) return existing;

    const profile = await this.profiles.save(
      this.profiles.create({
        tenantId: tenant.tenantId,
        appPartnerId,
        tierId: null,
        certifications: {},
        complianceStatus: 'pending',
        sandboxEnabled: false,
        metadata: {},
      }),
    );
    // Keep regions/capabilities empty until the partner submits an application.
    return profile;
  }

  private async requireApplication(tenant: TenantContext, appPartnerId: string, applicationId: string) {
    const app = await this.applications.findOne({ where: { tenantId: tenant.tenantId, id: applicationId, appPartnerId } });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  private async requireClientTenantAccess(tenant: TenantContext, appPartnerId: string, clientTenantId: string): Promise<PartnerClientTenantEntity> {
    const access = await this.clientTenants.findOne({
      where: { tenantId: tenant.tenantId, appPartnerId, clientTenantId },
      order: { createdAt: 'DESC' },
    });
    if (!access || access.status !== 'active') throw new UnauthorizedException('Client tenant access not found');
    return access;
  }
}

