import { Injectable } from '@nestjs/common';
import { throwAdminResourceNotFound } from '../domain/admin-domain.errors';
import { AdminSettingsRepository } from '../repositories/admin-settings.repository';
import { AdminUpdateBusinessInfoDto } from '../dto/admin-update-business-info.dto';
import { AdminUpdateOpeningHoursDto } from '../dto/admin-update-opening-hours.dto';
import { AdminUpdateDeliveryZonesDto } from '../dto/admin-update-delivery-zones.dto';
import { AdminUpdatePaymentSettingsDto } from '../dto/admin-update-payment-settings.dto';
import { AdminUpdatePosSettingsDto } from '../dto/admin-update-pos-settings.dto';
import { AdminUpdateFulfillmentSettingsDto } from '../dto/admin-update-fulfillment-settings.dto';
import { AdminUpdateDeliverySettingsDto } from '../dto/admin-update-delivery-settings.dto';
import { AdminUpdateTenantLocalizationDto } from '../dto/admin-update-tenant-localization.dto';

const DEFAULT_TENANT_LOCALIZATION = {
  currency: 'EUR',
  currencySymbol: '€',
  locale: 'en-IE',
  timezone: 'Europe/Dublin',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: '1,234.56',
  country: 'IE',
  defaultTaxRate: '0.0000',
  deliveryEnabled: true,
  deliveryFee: '0.00',
  minimumOrderAmount: '0.00',
  freeDeliveryThreshold: null as string | null,
  deliveryRadiusKm: '5.00',
  deliveryZones: [] as Array<Record<string, unknown>>,
};

@Injectable()
export class TenantSettingsService {
  constructor(private readonly settingsRepository: AdminSettingsRepository) {}

  async updateBusinessInfo(tenantId: string, dto: AdminUpdateBusinessInfoDto) {
    const tenant = await this.settingsRepository.findTenant(tenantId);
    if (!tenant) {
      throwAdminResourceNotFound('tenant', tenantId);
    }
    if (dto.name !== undefined) tenant.name = dto.name;
    if (dto.slug !== undefined) tenant.slug = dto.slug;
    if (dto.subdomain !== undefined) tenant.subdomain = dto.subdomain;
    return this.settingsRepository.saveTenant(tenant);
  }

  async getTenantLocalization(tenantId: string) {
    const settings = await this.settingsRepository.getOrCreateTenantSettings(tenantId);
    return this.toTenantLocalization(settings);
  }

  async updateTenantLocalization(tenantId: string, dto: AdminUpdateTenantLocalizationDto) {
    const settings = await this.settingsRepository.getOrCreateTenantSettings(tenantId);
    if (dto.currency !== undefined) settings.currency = dto.currency.toUpperCase();
    if (dto.currencySymbol !== undefined) settings.currencySymbol = dto.currencySymbol;
    if (dto.locale !== undefined) settings.locale = dto.locale;
    if (dto.timezone !== undefined) settings.timezone = dto.timezone;
    if (dto.dateFormat !== undefined) settings.dateFormat = dto.dateFormat;
    if (dto.numberFormat !== undefined) settings.numberFormat = dto.numberFormat;
    if (dto.country !== undefined) settings.country = dto.country.toUpperCase();
    if (dto.defaultTaxRate !== undefined) settings.defaultTaxRate = dto.defaultTaxRate.toFixed(4);
    const saved = await this.settingsRepository.saveTenantSettings(settings);
    return this.toTenantLocalization(saved);
  }

  async updateOpeningHours(tenantId: string, dto: AdminUpdateOpeningHoursDto) {
    const hours = await this.settingsRepository.replaceOpeningHours(
      tenantId,
      dto.locationId,
      dto.entries.map((entry) => ({
        dayOfWeek: entry.dayOfWeek,
        openTime: entry.openTime ?? null,
        closeTime: entry.closeTime ?? null,
        isClosed: entry.isClosed ?? false,
      })),
    );
    return hours;
  }

  async updateDeliveryZones(tenantId: string, dto: AdminUpdateDeliveryZonesDto) {
    if (dto.locationId) {
      const location = await this.settingsRepository.requireLocationForTenant(tenantId, dto.locationId);
      location.deliveryZones = dto.zones;
      return this.settingsRepository.saveLocation(location);
    }
    const settings = await this.settingsRepository.getOrCreateTenantSettings(tenantId);
    settings.deliveryZones = dto.zones;
    const saved = await this.settingsRepository.saveTenantSettings(settings);
    return this.toTenantLocalization(saved);
  }

  async updateDeliverySettings(tenantId: string, dto: AdminUpdateDeliverySettingsDto) {
    const settings = await this.settingsRepository.getOrCreateTenantSettings(tenantId);
    if (dto.deliveryEnabled !== undefined) settings.deliveryEnabled = dto.deliveryEnabled;
    if (dto.deliveryFee !== undefined) settings.deliveryFee = dto.deliveryFee.toFixed(2);
    if (dto.minimumOrderAmount !== undefined) settings.minimumOrderAmount = dto.minimumOrderAmount.toFixed(2);
    if (dto.freeDeliveryThreshold !== undefined) {
      settings.freeDeliveryThreshold = dto.freeDeliveryThreshold === null ? null : dto.freeDeliveryThreshold.toFixed(2);
    }
    if (dto.deliveryRadiusKm !== undefined) settings.deliveryRadiusKm = dto.deliveryRadiusKm.toFixed(2);
    if (dto.deliveryZones !== undefined) settings.deliveryZones = dto.deliveryZones;

    if (dto.locationId) {
      const location = await this.settingsRepository.requireLocationForTenant(tenantId, dto.locationId);
      if (dto.deliveryZones !== undefined) location.deliveryZones = dto.deliveryZones;
      await this.settingsRepository.saveLocation(location);
      const row = await this.settingsRepository.getOrCreateSettings(dto.locationId);
      const current = (row.settings?.deliverySettings as Record<string, unknown> | undefined) ?? {};
      await this.settingsRepository.mergeSettings(tenantId, dto.locationId, {
        deliverySettings: {
          deliveryRadiusKm: Number(settings.deliveryRadiusKm),
          deliveryFee: Number(settings.deliveryFee),
          minimumOrderAmount: Number(settings.minimumOrderAmount),
          freeDeliveryThreshold: settings.freeDeliveryThreshold ? Number(settings.freeDeliveryThreshold) : null,
          autoAssignDrivers: false,
          maxActiveDeliveriesPerDriver: 3,
          ...current,
          ...(dto.autoAssignDrivers !== undefined ? { autoAssignDrivers: dto.autoAssignDrivers } : {}),
          ...(dto.maxActiveDeliveriesPerDriver !== undefined
            ? { maxActiveDeliveriesPerDriver: dto.maxActiveDeliveriesPerDriver }
            : {}),
        },
      });
    }

    const saved = await this.settingsRepository.saveTenantSettings(settings);
    return this.toTenantLocalization(saved);
  }

  updatePaymentSettings(tenantId: string, dto: AdminUpdatePaymentSettingsDto) {
    return this.settingsRepository.mergeSettings(tenantId, dto.locationId, {
      paymentSettings: dto.settings,
    });
  }

  updatePosSettings(tenantId: string, dto: AdminUpdatePosSettingsDto) {
    return this.settingsRepository.mergeSettings(tenantId, dto.locationId, {
      posSettings: dto.settings,
    });
  }

  async updateFulfillmentSettings(tenantId: string, dto: AdminUpdateFulfillmentSettingsDto) {
    await this.settingsRepository.requireLocationForTenant(tenantId, dto.locationId);
    const row = await this.settingsRepository.getOrCreateSettings(dto.locationId);
    const current = (row.settings?.fulfillmentDisplay as Record<string, unknown> | undefined) ?? {};
    const next = {
      autoAcceptOrders: false,
      autoCompleteMinutes: null,
      soundAlerts: true,
      displayMode: 'grid',
      showCustomerInfo: true,
      ...current,
      ...(dto.autoAcceptOrders !== undefined ? { autoAcceptOrders: dto.autoAcceptOrders } : {}),
      ...(dto.autoCompleteMinutes !== undefined
        ? { autoCompleteMinutes: dto.autoCompleteMinutes }
        : {}),
      ...(dto.soundAlerts !== undefined ? { soundAlerts: dto.soundAlerts } : {}),
      ...(dto.displayMode !== undefined ? { displayMode: dto.displayMode } : {}),
      ...(dto.showCustomerInfo !== undefined ? { showCustomerInfo: dto.showCustomerInfo } : {}),
    };
    return this.settingsRepository.mergeSettings(tenantId, dto.locationId, {
      fulfillmentDisplay: next,
    });
  }

  async getSettings(tenantId: string, locationId: string) {
    await this.settingsRepository.requireLocationForTenant(tenantId, locationId);
    const settings = await this.settingsRepository.getOrCreateSettings(locationId);
    const hours = await this.settingsRepository.listOpeningHours(locationId);
    return { settings: settings.settings, openingHours: hours };
  }

  private toTenantLocalization(settings: typeof DEFAULT_TENANT_LOCALIZATION) {
    return {
      currency: settings.currency ?? DEFAULT_TENANT_LOCALIZATION.currency,
      currencySymbol: settings.currencySymbol ?? DEFAULT_TENANT_LOCALIZATION.currencySymbol,
      locale: settings.locale ?? DEFAULT_TENANT_LOCALIZATION.locale,
      timezone: settings.timezone ?? DEFAULT_TENANT_LOCALIZATION.timezone,
      dateFormat: settings.dateFormat ?? DEFAULT_TENANT_LOCALIZATION.dateFormat,
      numberFormat: settings.numberFormat ?? DEFAULT_TENANT_LOCALIZATION.numberFormat,
      country: settings.country ?? DEFAULT_TENANT_LOCALIZATION.country,
      defaultTaxRate: settings.defaultTaxRate ?? DEFAULT_TENANT_LOCALIZATION.defaultTaxRate,
      deliveryEnabled: settings.deliveryEnabled ?? DEFAULT_TENANT_LOCALIZATION.deliveryEnabled,
      deliveryFee: settings.deliveryFee ?? DEFAULT_TENANT_LOCALIZATION.deliveryFee,
      minimumOrderAmount: settings.minimumOrderAmount ?? DEFAULT_TENANT_LOCALIZATION.minimumOrderAmount,
      freeDeliveryThreshold: settings.freeDeliveryThreshold ?? DEFAULT_TENANT_LOCALIZATION.freeDeliveryThreshold,
      deliveryRadiusKm: settings.deliveryRadiusKm ?? DEFAULT_TENANT_LOCALIZATION.deliveryRadiusKm,
      deliveryZones: settings.deliveryZones ?? DEFAULT_TENANT_LOCALIZATION.deliveryZones,
    };
  }
}
