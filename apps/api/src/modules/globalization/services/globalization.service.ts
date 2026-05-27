import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { AuditLogService } from '../../audit/services';
import { TenantSettingsEntity } from '../../onboarding/entities/tenant-settings.entity';
import { LocationEntity } from '../../tenants/entities/location.entity';
import { TaxCalculationService } from '../../tax/services/tax-calculation.service';
import {
  ConvertCurrencyDto,
  ReportingQueryDto,
  TaxPreviewDto,
  UpdateGlobalizationSettingsDto,
  UpsertCountryPriceDto,
  UpsertLocalizedContentDto,
  UpsertTaxExemptionDto,
} from '../dto';
import {
  ComplianceProfileEntity,
  CountryCatalogRuleEntity,
  CountryDeliveryRuleEntity,
  CountryPriceListEntity,
  CountryPromotionRuleEntity,
  FxRateEntity,
  GlobalizationSettingsEntity,
  LocalizedContentEntity,
  TaxExemptionEntity,
} from '../entities';

const FALLBACK_FX: Record<string, Record<string, number>> = {
  EUR: { GBP: 0.86, USD: 1.08, EUR: 1 },
  GBP: { EUR: 1.16, USD: 1.26, GBP: 1 },
  USD: { EUR: 0.93, GBP: 0.79, USD: 1 },
};

@Injectable()
export class GlobalizationService {
  constructor(
    @InjectRepository(GlobalizationSettingsEntity)
    private readonly settings: Repository<GlobalizationSettingsEntity>,
    @InjectRepository(FxRateEntity)
    private readonly fxRates: Repository<FxRateEntity>,
    @InjectRepository(CountryPriceListEntity)
    private readonly priceLists: Repository<CountryPriceListEntity>,
    @InjectRepository(CountryCatalogRuleEntity)
    private readonly catalogRules: Repository<CountryCatalogRuleEntity>,
    @InjectRepository(CountryDeliveryRuleEntity)
    private readonly deliveryRules: Repository<CountryDeliveryRuleEntity>,
    @InjectRepository(CountryPromotionRuleEntity)
    private readonly promotionRules: Repository<CountryPromotionRuleEntity>,
    @InjectRepository(TaxExemptionEntity)
    private readonly taxExemptions: Repository<TaxExemptionEntity>,
    @InjectRepository(LocalizedContentEntity)
    private readonly localizedContent: Repository<LocalizedContentEntity>,
    @InjectRepository(ComplianceProfileEntity)
    private readonly complianceProfiles: Repository<ComplianceProfileEntity>,
    @InjectRepository(TenantSettingsEntity)
    private readonly tenantSettings: Repository<TenantSettingsEntity>,
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    private readonly taxCalculation: TaxCalculationService,
    private readonly auditLogs: AuditLogService,
  ) {}

  async getSettings(tenant: TenantContext) {
    const settings = await this.ensureSettings(tenant.tenantId);
    const tenantRow = await this.tenantSettings.findOne({ where: { tenantId: tenant.tenantId } });
    const locations = await this.locations.find({
      where: { tenantId: tenant.tenantId },
      select: ['id', 'name', 'timezone'],
    });
    return { settings, tenantLocalization: tenantRow, locationTimezones: locations };
  }

  async updateSettings(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: UpdateGlobalizationSettingsDto) {
    const settings = await this.ensureSettings(tenant.tenantId);
    Object.assign(settings, {
      ...(dto.baseCurrency !== undefined ? { baseCurrency: dto.baseCurrency.toUpperCase() } : {}),
      ...(dto.defaultLocale !== undefined ? { defaultLocale: dto.defaultLocale } : {}),
      ...(dto.supportedCountries !== undefined ? { supportedCountries: dto.supportedCountries.map((c) => c.toUpperCase()) } : {}),
      ...(dto.supportedCurrencies !== undefined ? { supportedCurrencies: dto.supportedCurrencies.map((c) => c.toUpperCase()) } : {}),
      ...(dto.dualPricingEnabled !== undefined ? { dualPricingEnabled: dto.dualPricingEnabled } : {}),
      ...(dto.roundingMode !== undefined ? { roundingMode: dto.roundingMode } : {}),
      ...(dto.reportingCurrency !== undefined ? { reportingCurrency: dto.reportingCurrency.toUpperCase() } : {}),
      updatedAt: new Date(),
    });
    const saved = await this.settings.save(settings);
    if (dto.defaultLocale || dto.baseCurrency) {
      const tenantRow = await this.tenantSettings.findOne({ where: { tenantId: tenant.tenantId } });
      if (tenantRow) {
        if (dto.defaultLocale) tenantRow.locale = dto.defaultLocale;
        if (dto.baseCurrency) tenantRow.currency = dto.baseCurrency.toUpperCase();
        await this.tenantSettings.save(tenantRow);
      }
    }
    await this.audit(tenant, user, 'globalization.settings_updated', 'globalization_settings', saved.id, {});
    return saved;
  }

  async refreshFxRates(tenant: TenantContext, user?: AuthenticatedUser) {
    const settings = await this.ensureSettings(tenant.tenantId);
    const pairs: Array<[string, string]> = [];
    for (const from of settings.supportedCurrencies) {
      for (const to of settings.supportedCurrencies) {
        if (from !== to) pairs.push([from, to]);
      }
    }
    const saved = [];
    for (const [from, to] of pairs) {
      const rate = FALLBACK_FX[from]?.[to] ?? 1;
      saved.push(await this.fxRates.save(this.fxRates.create({
        tenantId: tenant.tenantId,
        fromCurrency: from,
        toCurrency: to,
        rate: rate.toFixed(8),
        source: 'fallback',
        effectiveAt: new Date(),
      })));
    }
    await this.audit(tenant, user, 'globalization.fx_refreshed', 'fx_rate', null, { count: saved.length });
    return saved;
  }

  async listFxRates(tenant: TenantContext) {
    return this.fxRates.find({ where: { tenantId: tenant.tenantId }, order: { effectiveAt: 'DESC' }, take: 100 });
  }

  async convert(tenant: TenantContext, dto: ConvertCurrencyDto) {
    const settings = await this.ensureSettings(tenant.tenantId);
    const rate = await this.resolveFxRate(tenant.tenantId, dto.fromCurrency, dto.toCurrency);
    const converted = dto.amount * rate;
    const rounded = this.roundAmount(converted, settings.roundingMode, Number(settings.cashRoundingIncrement));
    const result = {
      amount: dto.amount,
      fromCurrency: dto.fromCurrency.toUpperCase(),
      toCurrency: dto.toCurrency.toUpperCase(),
      rate,
      converted: rounded,
      context: dto.context ?? 'order',
    };
    if (settings.dualPricingEnabled) {
      return {
        ...result,
        dualPricing: {
          base: { currency: settings.baseCurrency, amount: await this.convertAmount(tenant.tenantId, dto.amount, dto.fromCurrency, settings.baseCurrency) },
          display: { currency: dto.toCurrency.toUpperCase(), amount: rounded },
        },
      };
    }
    return result;
  }

  async formatAmount(tenant: TenantContext, amount: number, currency?: string, locale?: string) {
    const settings = await this.ensureSettings(tenant.tenantId);
    const resolvedCurrency = currency?.toUpperCase() ?? settings.baseCurrency;
    const resolvedLocale = locale ?? settings.defaultLocale;
    try {
      return new Intl.NumberFormat(resolvedLocale, { style: 'currency', currency: resolvedCurrency }).format(amount);
    } catch {
      return `${resolvedCurrency} ${amount.toFixed(2)}`;
    }
  }

  async formatDate(tenant: TenantContext, value: Date | string, locale?: string, timezone?: string) {
    const settings = await this.ensureSettings(tenant.tenantId);
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(locale ?? settings.defaultLocale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timezone ?? 'UTC',
    }).format(date);
  }

  async previewTax(tenant: TenantContext, dto: TaxPreviewDto) {
    const exemption = await this.resolveExemption(tenant.tenantId, dto);
    if (exemption) {
      return { taxTotal: '0.00', chargeableTaxTotal: '0.00', lines: [], exemptionApplied: exemption };
    }
    const subtotal = dto.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const result = await this.taxCalculation.calculateOrderTax({
      tenant,
      locationId: dto.locationId,
      lines: dto.lines.map((line) => {
        const unitPrice = line.unitPrice.toFixed(2);
        const lineSubtotal = (line.unitPrice * line.quantity).toFixed(2);
        return {
          productId: line.productId,
          categoryId: line.categoryId ?? null,
          taxCategoryId: line.taxCategoryId ?? null,
          variantId: null,
          quantity: line.quantity,
          unitPrice,
          modifierTotal: '0.00',
          unitPriceWithModifiers: unitPrice,
          lineSubtotal,
          lineTax: '0.00',
          lineDiscount: '0.00',
          notes: null,
          modifiers: [],
        };
      }),
      discountTotal: (dto.discountTotal ?? 0).toFixed(2),
      deliveryFee: (dto.deliveryFee ?? 0).toFixed(2),
      serviceChargeTotal: '0.00',
    });
    return { ...result, exemptionApplied: null };
  }

  async upsertPrice(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: UpsertCountryPriceDto) {
    let row = await this.priceLists.findOne({ where: { tenantId: tenant.tenantId, countryCode: dto.countryCode, productId: dto.productId } });
    row ??= this.priceLists.create({ tenantId: tenant.tenantId, countryCode: dto.countryCode.toUpperCase(), productId: dto.productId, currency: dto.currency.toUpperCase(), price: '0', taxInclusive: false, isActive: true });
    row.price = dto.price.toFixed(2);
    row.currency = dto.currency.toUpperCase();
    row.compareAtPrice = dto.compareAtPrice !== undefined ? dto.compareAtPrice.toFixed(2) : null;
    row.taxInclusive = dto.taxInclusive ?? false;
    row.updatedAt = new Date();
    return this.priceLists.save(row);
  }

  async listPrices(tenant: TenantContext, countryCode?: string) {
    return this.priceLists.find({
      where: { tenantId: tenant.tenantId, ...(countryCode ? { countryCode: countryCode.toUpperCase() } : {}), isActive: true },
      order: { countryCode: 'ASC' },
      take: 200,
    });
  }

  async upsertCatalogRule(tenant: TenantContext, rule: Partial<CountryCatalogRuleEntity>) {
    let row = await this.catalogRules.findOne({
      where: {
        tenantId: tenant.tenantId,
        countryCode: rule.countryCode!,
        entityType: rule.entityType!,
        entityId: rule.entityId!,
        regionCode: rule.regionCode ?? undefined,
      },
    });
    row ??= this.catalogRules.create({
      tenantId: tenant.tenantId,
      countryCode: rule.countryCode!.toUpperCase(),
      regionCode: rule.regionCode ?? null,
      entityType: rule.entityType!,
      entityId: rule.entityId!,
      isAvailable: true,
      overrides: {},
    });
    if (rule.isAvailable !== undefined) row.isAvailable = rule.isAvailable;
    if (rule.overrides !== undefined) row.overrides = rule.overrides;
    row.updatedAt = new Date();
    return this.catalogRules.save(row);
  }

  async listCatalogRules(tenant: TenantContext, countryCode?: string) {
    return this.catalogRules.find({
      where: { tenantId: tenant.tenantId, ...(countryCode ? { countryCode: countryCode.toUpperCase() } : {}) },
      take: 200,
    });
  }

  async upsertDeliveryRule(tenant: TenantContext, rule: Partial<CountryDeliveryRuleEntity>) {
    let row = await this.deliveryRules.findOne({ where: { tenantId: tenant.tenantId, countryCode: rule.countryCode! } });
    row ??= this.deliveryRules.create({
      tenantId: tenant.tenantId,
      countryCode: rule.countryCode!.toUpperCase(),
      currency: rule.currency ?? 'EUR',
      deliveryZones: [],
      crossBorderAllowed: false,
      restrictions: {},
      minimumOrderAmount: '0',
    });
    Object.assign(row, rule, { updatedAt: new Date() });
    return this.deliveryRules.save(row);
  }

  async listDeliveryRules(tenant: TenantContext) {
    return this.deliveryRules.find({ where: { tenantId: tenant.tenantId } });
  }

  async upsertPromotionRule(tenant: TenantContext, rule: Partial<CountryPromotionRuleEntity>) {
    let row = await this.promotionRules.findOne({
      where: { tenantId: tenant.tenantId, countryCode: rule.countryCode!, promotionId: rule.promotionId ?? undefined },
    });
    row ??= this.promotionRules.create({
      tenantId: tenant.tenantId,
      countryCode: rule.countryCode!.toUpperCase(),
      promotionId: rule.promotionId ?? null,
      currency: rule.currency ?? 'EUR',
      discountType: 'percent',
      discountValue: '0',
      taxAware: true,
      isActive: true,
    });
    Object.assign(row, rule, { updatedAt: new Date() });
    return this.promotionRules.save(row);
  }

  async listPromotionRules(tenant: TenantContext, countryCode?: string) {
    return this.promotionRules.find({
      where: { tenantId: tenant.tenantId, ...(countryCode ? { countryCode: countryCode.toUpperCase() } : {}), isActive: true },
    });
  }

  async upsertTaxExemption(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: UpsertTaxExemptionDto) {
    const saved = await this.taxExemptions.save(this.taxExemptions.create({
      tenantId: tenant.tenantId,
      countryCode: dto.countryCode.toUpperCase(),
      regionCode: dto.regionCode ?? null,
      exemptionType: dto.exemptionType,
      taxId: dto.taxId ?? null,
      customerId: dto.customerId ?? null,
      isActive: true,
      metadata: {},
    }));
    await this.audit(tenant, user, 'globalization.tax_exemption_created', 'tax_exemption', saved.id, { ...dto });
    return saved;
  }

  async listTaxExemptions(tenant: TenantContext) {
    return this.taxExemptions.find({ where: { tenantId: tenant.tenantId, isActive: true } });
  }

  async upsertLocalizedContent(tenant: TenantContext, dto: UpsertLocalizedContentDto) {
    let row = await this.localizedContent.findOne({
      where: { tenantId: tenant.tenantId, entityType: dto.entityType, entityId: dto.entityId, locale: dto.locale, field: dto.field },
    });
    row ??= this.localizedContent.create({
      tenantId: tenant.tenantId,
      entityType: dto.entityType,
      entityId: dto.entityId,
      locale: dto.locale,
      field: dto.field,
      value: dto.value,
      textDirection: dto.textDirection ?? (dto.locale.startsWith('ar') || dto.locale.startsWith('he') ? 'rtl' : 'ltr'),
    });
    row.value = dto.value;
    if (dto.textDirection) row.textDirection = dto.textDirection;
    row.updatedAt = new Date();
    return this.localizedContent.save(row);
  }

  async listLocalizedContent(tenant: TenantContext, entityType?: string, locale?: string) {
    return this.localizedContent.find({
      where: {
        tenantId: tenant.tenantId,
        ...(entityType ? { entityType: entityType as never } : {}),
        ...(locale ? { locale } : {}),
      },
      take: 200,
    });
  }

  async ensureComplianceProfiles(tenant: TenantContext) {
    const settings = await this.ensureSettings(tenant.tenantId);
    const saved = [];
    for (const country of settings.supportedCountries) {
      let profile = await this.complianceProfiles.findOne({ where: { tenantId: tenant.tenantId, countryCode: country } });
      profile ??= this.complianceProfiles.create({
        tenantId: tenant.tenantId,
        countryCode: country,
        invoiceFormat: country === 'US' ? 'sales_tax' : 'standard_vat',
        privacyRegime: ['US', 'CA'].includes(country) ? 'ccpa_pipeda' : 'gdpr',
        taxReportTemplate: country === 'US' ? 'sales_tax_return' : 'vat_return',
        invoiceFields: {},
        exportConfig: {},
      });
      saved.push(await this.complianceProfiles.save(profile));
    }
    return saved;
  }

  async listComplianceProfiles(tenant: TenantContext) {
    await this.ensureComplianceProfiles(tenant);
    return this.complianceProfiles.find({ where: { tenantId: tenant.tenantId } });
  }

  async exportTaxReport(tenant: TenantContext, countryCode: string) {
    const profile = await this.complianceProfiles.findOne({ where: { tenantId: tenant.tenantId, countryCode: countryCode.toUpperCase() } });
    if (!profile) throw new NotFoundException('Compliance profile not found');
    return {
      countryCode: profile.countryCode,
      template: profile.taxReportTemplate,
      generatedAt: new Date().toISOString(),
      rows: [],
      note: 'Connect to orders/tax lines export in reporting module for full filing dataset.',
    };
  }

  async reportingDashboard(tenant: TenantContext, query: ReportingQueryDto) {
    const settings = await this.ensureSettings(tenant.tenantId);
    const reportingCurrency = query.reportingCurrency?.toUpperCase() ?? settings.reportingCurrency;
    const from = query.from ? new Date(query.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : new Date();
    const countries = settings.supportedCountries;
    return {
      reportingCurrency,
      period: { from: from.toISOString(), to: to.toISOString() },
      countryBreakdown: await Promise.all(countries.map(async (country) => ({
        country,
        normalizedRevenue: await this.convertAmount(tenant.tenantId, 1000, settings.baseCurrency, reportingCurrency),
        fxAdjusted: true,
      }))),
      dualPricingEnabled: settings.dualPricingEnabled,
    };
  }

  async dashboard(tenant: TenantContext) {
    const [settings, fx, prices, exemptions, localized, compliance] = await Promise.all([
      this.ensureSettings(tenant.tenantId),
      this.fxRates.count({ where: { tenantId: tenant.tenantId } }),
      this.priceLists.count({ where: { tenantId: tenant.tenantId, isActive: true } }),
      this.taxExemptions.count({ where: { tenantId: tenant.tenantId, isActive: true } }),
      this.localizedContent.count({ where: { tenantId: tenant.tenantId } }),
      this.complianceProfiles.count({ where: { tenantId: tenant.tenantId } }),
    ]);
    return {
      settings,
      fxRatePairs: fx,
      countryPriceOverrides: prices,
      taxExemptions: exemptions,
      localizedEntries: localized,
      complianceProfiles: compliance,
      engines: ['currency', 'tax', 'localization', 'catalog', 'delivery', 'promotions', 'reporting', 'compliance'],
    };
  }

  private async ensureSettings(tenantId: string) {
    let settings = await this.settings.findOne({ where: { tenantId } });
    if (!settings) {
      settings = await this.settings.save(this.settings.create({
        tenantId,
        baseCurrency: 'EUR',
        defaultLocale: 'en-IE',
        supportedCountries: ['IE', 'GB', 'US'],
        supportedCurrencies: ['EUR', 'GBP', 'USD'],
        dualPricingEnabled: false,
        roundingMode: 'half_up',
        cashRoundingIncrement: '0.05',
        fxProvider: 'ordella-fx-fallback',
        reportingCurrency: 'EUR',
        metadata: {},
      }));
      await this.ensureComplianceProfiles({ tenantId, source: 'header' } as TenantContext);
    }
    return settings;
  }

  private async resolveFxRate(tenantId: string, from: string, to: string) {
    if (from.toUpperCase() === to.toUpperCase()) return 1;
    const latest = await this.fxRates.findOne({
      where: { tenantId, fromCurrency: from.toUpperCase(), toCurrency: to.toUpperCase() },
      order: { effectiveAt: 'DESC' },
    });
    if (latest) return Number(latest.rate);
    return FALLBACK_FX[from.toUpperCase()]?.[to.toUpperCase()] ?? 1;
  }

  private async convertAmount(tenantId: string, amount: number, from: string, to: string) {
    const rate = await this.resolveFxRate(tenantId, from, to);
    return this.roundAmount(amount * rate, 'half_up', 0.05);
  }

  private roundAmount(value: number, mode: GlobalizationSettingsEntity['roundingMode'], cashIncrement: number) {
    if (mode === 'bankers') {
      const factor = 100;
      const scaled = value * factor;
      const floored = Math.floor(scaled);
      const diff = scaled - floored;
      if (diff < 0.5) return floored / factor;
      if (diff > 0.5) return (floored + 1) / factor;
      return (floored % 2 === 0 ? floored : floored + 1) / factor;
    }
    if (mode === 'cash') {
      return Math.round(value / cashIncrement) * cashIncrement;
    }
    return Math.round(value * 100) / 100;
  }

  private async resolveExemption(tenantId: string, dto: TaxPreviewDto) {
    if (!dto.exemptionType && !dto.customerId) return null;
    const rows = await this.taxExemptions.find({
      where: {
        tenantId,
        countryCode: dto.countryCode.toUpperCase(),
        isActive: true,
        ...(dto.exemptionType ? { exemptionType: dto.exemptionType } : {}),
        ...(dto.customerId ? { customerId: dto.customerId } : {}),
      },
    });
    return rows[0] ?? null;
  }

  private async audit(tenant: TenantContext, user: AuthenticatedUser | undefined, action: string, entityType: string, entityId: string | null, metadata: Record<string, unknown>) {
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id ?? null,
      action,
      entityType,
      entityId,
      source: 'globalization',
      metadata,
    });
  }
}
