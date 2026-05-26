import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { CategoryEntity } from '../../catalog/entities/category.entity';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { ProductStatus } from '../../catalog/enums/product-status.enum';
import { LocationOpeningHoursEntity } from '../../tenants/entities/location-opening-hours.entity';
import { LocationEntity } from '../../tenants/entities/location.entity';
import {
  RETAIL_DEMO_CATEGORIES,
  RETAIL_DEMO_PRODUCTS,
} from '../../../database/seeds/retail-demo-catalog.seed';
import { OnboardingStep } from '../enums/onboarding-step.enum';
import { OnboardingRepository } from '../repositories/onboarding.repositories';
import { TenantAccessService } from './tenant-access.service';
import { OnboardingWizardService } from './onboarding-wizard.service';
import {
  CatalogStarterDto,
  InitSampleCatalogDto,
  UpdateBusinessDetailsDto,
  UpdateLocationSetupDto,
  UpdateOnboardingBrandingDto,
  UpdateTenantSettingsDto,
} from '../dto/onboarding-provisioning.dto';
import {
  DEFAULT_CURRENCY,
  DEFAULT_CURRENCY_SYMBOL,
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
  DEFAULT_DATE_FORMAT,
  DEFAULT_NUMBER_FORMAT,
  DEFAULT_COUNTRY,
  DEFAULT_TAX_RATE,
  defaultLocationSettings,
  defaultOpeningHoursRows,
  defaultTenantLocalizationSettings,
  defaultTenantMetadata,
} from '../constants/default-provisioning';

@Injectable()
export class OnboardingProvisioningService {
  constructor(
    private readonly repository: OnboardingRepository,
    private readonly tenantAccess: TenantAccessService,
    private readonly wizard: OnboardingWizardService,
    @InjectRepository(CategoryEntity)
    private readonly categories: Repository<CategoryEntity>,
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    @InjectRepository(LocationOpeningHoursEntity)
    private readonly openingHours: Repository<LocationOpeningHoursEntity>,
  ) {}

  async saveBusinessDetails(
    user: AuthenticatedUser,
    tenant: TenantContext,
    dto: UpdateBusinessDetailsDto,
  ) {
    await this.tenantAccess.assertAdmin(user, tenant);
    const settings = await this.repository.findSettings(tenant.tenantId);
    if (!settings) {
      throw new BadRequestException('Tenant settings not found');
    }

    const metadata = {
      ...defaultTenantMetadata(),
      ...(settings.metadata ?? {}),
      businessName: dto.businessName.trim(),
      businessType: dto.businessType ?? null,
      timezone: dto.timezone,
      fulfillmentEnabled: true,
      deliveryEnabled: true,
      pickupEnabled: true,
    };

    settings.currency = dto.currency;
    settings.currencySymbol = DEFAULT_CURRENCY_SYMBOL;
    settings.locale = DEFAULT_LOCALE;
    settings.timezone = dto.timezone;
    settings.dateFormat = DEFAULT_DATE_FORMAT;
    settings.numberFormat = DEFAULT_NUMBER_FORMAT;
    settings.country = DEFAULT_COUNTRY;
    settings.defaultTaxRate = DEFAULT_TAX_RATE;
    settings.metadata = metadata;
    await this.repository.saveSettings(settings);

    const tenantRow = await this.repository.findTenantById(tenant.tenantId);
    if (tenantRow && dto.businessName.trim()) {
      tenantRow.name = dto.businessName.trim();
      await this.repository.saveTenant(tenantRow);
    }

    const branding = await this.repository.findBranding(tenant.tenantId);
    if (branding) {
      branding.businessInfo = {
        ...(branding.businessInfo ?? {}),
        businessName: dto.businessName.trim(),
        businessType: dto.businessType ?? null,
      };
      await this.repository.saveBranding(branding);
    }

    const location = await this.repository.findPrimaryLocation(tenant.tenantId);
    if (location) {
      location.timezone = dto.timezone;
      await this.repository.saveLocation(location);
    }

    await this.wizard.completeStep(user, tenant, OnboardingStep.BUSINESS);
    return this.wizard.getProgress(tenant.tenantId);
  }

  async saveLocationSetup(
    user: AuthenticatedUser,
    tenant: TenantContext,
    dto: UpdateLocationSetupDto,
  ) {
    await this.tenantAccess.assertAdmin(user, tenant);
    const location = dto.locationId
      ? await this.repository.findLocationForTenant(tenant.tenantId, dto.locationId)
      : await this.repository.findPrimaryLocation(tenant.tenantId);

    if (!location) {
      throw new BadRequestException('No location found for tenant');
    }

    location.name = dto.locationName.trim();
    location.address = dto.address?.trim() ?? null;
    await this.repository.saveLocation(location);

    const settingsRow = await this.repository.findLocationSettings(location.id);
    const patch = defaultLocationSettings();
    const merged = {
      ...(settingsRow?.settings ?? patch),
      phone: dto.phone ?? '',
      fulfillment: {
        pickupEnabled: dto.pickupEnabled ?? true,
        deliveryEnabled: dto.deliveryEnabled ?? true,
      },
    };
    await this.repository.saveLocationSettings({
      locationId: location.id,
      settings: merged,
    });

    if (dto.openingHours?.length) {
      await this.openingHours.delete({ locationId: location.id });
      const rows = dto.openingHours.map((entry) =>
        this.openingHours.create({
          locationId: location.id,
          dayOfWeek: entry.dayOfWeek,
          openTime: entry.openTime ?? null,
          closeTime: entry.closeTime ?? null,
          isClosed: entry.isClosed ?? false,
        }),
      );
      await this.openingHours.save(rows);
    }

    const tenantSettings = await this.repository.findSettings(tenant.tenantId);
    if (tenantSettings) {
      tenantSettings.metadata = {
        ...(tenantSettings.metadata ?? {}),
        pickupEnabled: dto.pickupEnabled ?? true,
        deliveryEnabled: dto.deliveryEnabled ?? true,
      };
      await this.repository.saveSettings(tenantSettings);
    }

    await this.wizard.completeStep(user, tenant, OnboardingStep.LOCATION);
    return this.wizard.getProgress(tenant.tenantId);
  }

  async initCatalog(
    user: AuthenticatedUser,
    tenant: TenantContext,
    dto: InitSampleCatalogDto,
  ) {
    await this.tenantAccess.assertAdmin(user, tenant);
    const existing = await this.categories.count({ where: { tenantId: tenant.tenantId } });
    if (existing > 0 && !dto.force) {
      return { seeded: false, categories: existing };
    }

    if (dto.force) {
      await this.products.delete({ tenantId: tenant.tenantId });
      await this.categories.delete({ tenantId: tenant.tenantId });
    }

    const categoryByName = new Map<string, string>();
    for (const row of RETAIL_DEMO_CATEGORIES) {
      const saved = await this.categories.save(
        this.categories.create({
          tenantId: tenant.tenantId,
          name: row.name,
          description: row.description,
          sortOrder: categoryByName.size,
          isActive: true,
        }),
      );
      categoryByName.set(row.name, saved.id);
    }

    for (const product of RETAIL_DEMO_PRODUCTS) {
      const categoryId = categoryByName.get(product.category);
      await this.products.save(
        this.products.create({
          tenantId: tenant.tenantId,
          name: product.name,
          categoryId: categoryId ?? null,
          price: product.price,
          sku: product.sku,
          status: ProductStatus.ACTIVE,
          sortOrder: 0,
          channelVisibility: { pos: true, online: true },
        }),
      );
    }

    await this.markCatalogInitialized(tenant.tenantId);
    return { seeded: true, categories: RETAIL_DEMO_CATEGORIES.length, items: RETAIL_DEMO_PRODUCTS.length };
  }

  async saveCatalogStarter(
    user: AuthenticatedUser,
    tenant: TenantContext,
    dto: CatalogStarterDto,
  ) {
    await this.tenantAccess.assertAdmin(user, tenant);
    if (dto.firstItem) {
      let category = await this.categories.findOne({
        where: { tenantId: tenant.tenantId, name: dto.firstItem.categoryName.trim() },
      });
      if (!category) {
        category = await this.categories.save(
          this.categories.create({
            tenantId: tenant.tenantId,
            name: dto.firstItem.categoryName.trim(),
            sortOrder: 0,
          }),
        );
      }
      await this.products.save(
        this.products.create({
          tenantId: tenant.tenantId,
          name: dto.firstItem.itemName.trim(),
          categoryId: category.id,
          price: dto.firstItem.price,
          status: ProductStatus.ACTIVE,
          sortOrder: 0,
          channelVisibility: {},
        }),
      );
    }
    await this.markCatalogInitialized(tenant.tenantId);
    await this.wizard.completeStep(user, tenant, OnboardingStep.CATALOG);
    return this.wizard.getProgress(tenant.tenantId);
  }

  async updateSettings(
    user: AuthenticatedUser,
    tenant: TenantContext,
    dto: UpdateTenantSettingsDto,
  ) {
    await this.tenantAccess.assertAdmin(user, tenant);
    const settings = await this.repository.findSettings(tenant.tenantId);
    if (!settings) {
      throw new BadRequestException('Tenant settings not found');
    }

    const metadata = { ...defaultTenantMetadata(), ...(settings.metadata ?? {}) };
    if (dto.businessName !== undefined) metadata.businessName = dto.businessName;
    if (dto.businessType !== undefined) metadata.businessType = dto.businessType;
    if (dto.timezone !== undefined) metadata.timezone = dto.timezone;
    if (dto.fulfillmentEnabled !== undefined) metadata.fulfillmentEnabled = dto.fulfillmentEnabled;
    if (dto.deliveryEnabled !== undefined) metadata.deliveryEnabled = dto.deliveryEnabled;
    if (dto.pickupEnabled !== undefined) metadata.pickupEnabled = dto.pickupEnabled;
    if (dto.currency !== undefined) settings.currency = dto.currency;
    if (dto.currencySymbol !== undefined) settings.currencySymbol = dto.currencySymbol;
    if (dto.locale !== undefined) settings.locale = dto.locale;
    if (dto.timezone !== undefined) settings.timezone = dto.timezone;
    if (dto.dateFormat !== undefined) settings.dateFormat = dto.dateFormat;
    if (dto.numberFormat !== undefined) settings.numberFormat = dto.numberFormat;
    if (dto.country !== undefined) settings.country = dto.country;
    if (dto.defaultTaxRate !== undefined) settings.defaultTaxRate = dto.defaultTaxRate.toFixed(4);
    settings.metadata = metadata;
    await this.repository.saveSettings(settings);
    return { ...defaultTenantLocalizationSettings(), ...settings };
  }

  async getTenantSettings(tenant: TenantContext) {
    const settings = await this.repository.findSettings(tenant.tenantId);
    if (!settings) {
      return defaultTenantLocalizationSettings();
    }
    return {
      ...defaultTenantLocalizationSettings(),
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      locale: settings.locale,
      timezone: settings.timezone,
      dateFormat: settings.dateFormat,
      numberFormat: settings.numberFormat,
      country: settings.country,
      defaultTaxRate: settings.defaultTaxRate,
    };
  }

  async updateBranding(
    user: AuthenticatedUser,
    tenant: TenantContext,
    dto: UpdateOnboardingBrandingDto,
  ) {
    await this.tenantAccess.assertAdmin(user, tenant);
    const branding = await this.repository.findBranding(tenant.tenantId);
    if (!branding) {
      throw new BadRequestException('Branding not found');
    }

    if (dto.logoUrl !== undefined) {
      branding.logoUrl = dto.logoUrl;
    }
    if (dto.primaryColor) {
      branding.theme = {
        ...branding.theme,
        colors: {
          ...(branding.theme?.colors ?? {}),
          primary: dto.primaryColor,
        },
      };
    }
    branding.businessInfo = {
      ...(branding.businessInfo ?? {}),
      receiptHeader: dto.receiptHeader ?? '',
      receiptFooter: dto.receiptFooter ?? '',
    };
    await this.repository.saveBranding(branding);
    await this.wizard.completeStep(user, tenant, OnboardingStep.BRANDING);
    return this.wizard.getProgress(tenant.tenantId);
  }

  async getSetupStatus(tenantId: string) {
    const [productCount, orderCount] = await Promise.all([
      this.products.count({ where: { tenantId } }),
      this.repository.countOrdersForTenant(tenantId),
    ]);
    return {
      hasCatalog: productCount > 0,
      hasOrders: orderCount > 0,
      productCount,
      orderCount,
    };
  }

  private async markCatalogInitialized(tenantId: string): Promise<void> {
    const settings = await this.repository.findSettings(tenantId);
    if (!settings) return;
    settings.metadata = {
      ...(settings.metadata ?? {}),
      catalogInitialized: true,
    };
    await this.repository.saveSettings(settings);
  }
}
