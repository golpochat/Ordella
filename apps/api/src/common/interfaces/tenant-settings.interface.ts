export interface TenantLocalizationSettings {
  currency: string;
  currencySymbol: string;
  locale: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  country: string;
  defaultTaxRate: string;
  deliveryEnabled: boolean;
  deliveryFee: string;
  minimumOrderAmount: string;
  freeDeliveryThreshold: string | null;
  deliveryRadiusKm: string;
  deliveryZones: Array<Record<string, unknown>>;
  notificationEmailEnabled: boolean;
  notificationSmsEnabled: boolean;
  notificationPushEnabled: boolean;
  notificationFromName: string;
  notificationFromEmail: string;
}

