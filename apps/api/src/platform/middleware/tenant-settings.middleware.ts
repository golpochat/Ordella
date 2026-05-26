import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NextFunction, Response } from 'express';
import { Repository } from 'typeorm';
import { TENANT_CONTEXT_KEY } from '../../common/constants/tenant-context-key';
import { TENANT_SETTINGS_KEY } from '../../common/constants/tenant-settings-key';
import { TenantLocalizationSettings } from '../../common/interfaces';
import { RequestWithTenant } from '../../common/interfaces/request-with-tenant.interface';
import { TenantSettingsEntity } from '../../modules/onboarding/entities/tenant-settings.entity';

const DEFAULT_TENANT_SETTINGS: TenantLocalizationSettings = {
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
  freeDeliveryThreshold: null,
  deliveryRadiusKm: '5.00',
  deliveryZones: [],
};

@Injectable()
export class TenantSettingsMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(TenantSettingsEntity)
    private readonly tenantSettings: Repository<TenantSettingsEntity>,
  ) {}

  async use(req: RequestWithTenant, _res: Response, next: NextFunction): Promise<void> {
    const tenant = req[TENANT_CONTEXT_KEY];
    if (!tenant?.tenantId) {
      next();
      return;
    }

    const settings = await this.resolveSettings(tenant.tenantId);
    req[TENANT_SETTINGS_KEY] = settings;
    tenant.settings = settings;
    next();
  }

  private async resolveSettings(tenantId: string): Promise<TenantLocalizationSettings> {
    const row = await this.tenantSettings.findOne({ where: { tenantId } });
    return {
      ...DEFAULT_TENANT_SETTINGS,
      ...(row
        ? {
            currency: row.currency,
            currencySymbol: row.currencySymbol,
            locale: row.locale,
            timezone: row.timezone,
            dateFormat: row.dateFormat,
            numberFormat: row.numberFormat,
            country: row.country,
            defaultTaxRate: row.defaultTaxRate,
            deliveryEnabled: row.deliveryEnabled,
            deliveryFee: row.deliveryFee,
            minimumOrderAmount: row.minimumOrderAmount,
            freeDeliveryThreshold: row.freeDeliveryThreshold,
            deliveryRadiusKm: row.deliveryRadiusKm,
            deliveryZones: row.deliveryZones,
          }
        : {}),
    };
  }
}

