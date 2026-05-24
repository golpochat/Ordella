import { Injectable } from '@nestjs/common';
import { AdminSettingsRepository } from '../../admin/repositories/admin-settings.repository';

export type FulfillmentDisplaySettings = {
  autoAcceptOrders: boolean;
  autoCompleteMinutes: number | null;
  soundAlerts: boolean;
  displayMode: 'grid' | 'list';
  showCustomerInfo: boolean;
};

const DEFAULTS: FulfillmentDisplaySettings = {
  autoAcceptOrders: false,
  autoCompleteMinutes: null,
  soundAlerts: true,
  displayMode: 'grid',
  showCustomerInfo: true,
};

@Injectable()
export class FulfillmentSettingsService {
  constructor(private readonly settingsRepository: AdminSettingsRepository) {}

  async getForLocation(
    tenantId: string,
    locationId: string,
  ): Promise<FulfillmentDisplaySettings> {
    await this.settingsRepository.requireLocationForTenant(tenantId, locationId);
    const row = await this.settingsRepository.getOrCreateSettings(locationId);
    const raw = row.settings?.fulfillmentDisplay as Partial<FulfillmentDisplaySettings> | undefined;
    return { ...DEFAULTS, ...raw };
  }

  async mergeForLocation(
    tenantId: string,
    locationId: string,
    patch: Partial<FulfillmentDisplaySettings>,
  ): Promise<FulfillmentDisplaySettings> {
    await this.settingsRepository.requireLocationForTenant(tenantId, locationId);
    const current = await this.getForLocation(tenantId, locationId);
    const next = { ...current, ...patch };
    await this.settingsRepository.mergeSettings(tenantId, locationId, {
      fulfillmentDisplay: next,
    });
    return next;
  }
}
