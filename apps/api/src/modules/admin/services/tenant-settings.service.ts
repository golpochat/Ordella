import { Injectable } from '@nestjs/common';
import { throwAdminResourceNotFound } from '../domain/admin-domain.errors';
import { AdminSettingsRepository } from '../repositories/admin-settings.repository';
import { AdminUpdateBusinessInfoDto } from '../dto/admin-update-business-info.dto';
import { AdminUpdateOpeningHoursDto } from '../dto/admin-update-opening-hours.dto';
import { AdminUpdateDeliveryZonesDto } from '../dto/admin-update-delivery-zones.dto';
import { AdminUpdatePaymentSettingsDto } from '../dto/admin-update-payment-settings.dto';
import { AdminUpdatePosSettingsDto } from '../dto/admin-update-pos-settings.dto';

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

  updateDeliveryZones(tenantId: string, dto: AdminUpdateDeliveryZonesDto) {
    return this.settingsRepository.mergeSettings(tenantId, dto.locationId, {
      deliveryZones: dto.zones,
    });
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

  async getSettings(tenantId: string, locationId: string) {
    await this.settingsRepository.requireLocationForTenant(tenantId, locationId);
    const settings = await this.settingsRepository.getOrCreateSettings(locationId);
    const hours = await this.settingsRepository.listOpeningHours(locationId);
    return { settings: settings.settings, openingHours: hours };
  }
}
