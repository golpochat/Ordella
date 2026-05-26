import { z } from 'zod';

export const tenantSettingsSchema = z.object({
  currency: z.string().default('EUR'),
  currencySymbol: z.string().default('€'),
  locale: z.string().default('en-IE'),
  timezone: z.string().default('Europe/Dublin'),
  dateFormat: z.string().default('DD/MM/YYYY'),
  numberFormat: z.string().default('1,234.56'),
  country: z.string().default('IE'),
  defaultTaxRate: z.string().default('0.0000'),
  deliveryEnabled: z.boolean().default(true),
  deliveryFee: z.string().default('0.00'),
  minimumOrderAmount: z.string().default('0.00'),
  freeDeliveryThreshold: z.string().nullable().default(null),
  deliveryRadiusKm: z.string().default('5.00'),
  deliveryZones: z.array(z.record(z.unknown())).default([]),
  notificationEmailEnabled: z.boolean().default(true),
  notificationSmsEnabled: z.boolean().default(false),
  notificationPushEnabled: z.boolean().default(true),
  notificationFromName: z.string().default('Ordella'),
  notificationFromEmail: z.string().default('noreply@ordella.app'),
});

export type TenantSettings = z.infer<typeof tenantSettingsSchema>;

export const DEFAULT_TENANT_SETTINGS: TenantSettings = {
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
  notificationEmailEnabled: true,
  notificationSmsEnabled: false,
  notificationPushEnabled: true,
  notificationFromName: 'Ordella',
  notificationFromEmail: 'noreply@ordella.app',
};

export function normalizeTenantSettings(value: unknown): TenantSettings {
  return tenantSettingsSchema.catch(DEFAULT_TENANT_SETTINGS).parse(value);
}

export function formatTenantCurrency(
  value: string | number | null | undefined,
  settings: TenantSettings = DEFAULT_TENANT_SETTINGS,
): string {
  if (value === null || value === undefined || value === '') return `${settings.currencySymbol}0.00`;
  const amount = typeof value === 'number' ? value : Number.parseFloat(value);
  if (Number.isNaN(amount)) return `${settings.currencySymbol}${String(value)}`;

  try {
    return new Intl.NumberFormat(settings.locale, {
      style: 'currency',
      currency: settings.currency,
    }).format(amount);
  } catch {
    return `${settings.currencySymbol}${amount.toFixed(2)}`;
  }
}

export function formatTenantNumber(
  value: string | number | null | undefined,
  settings: TenantSettings = DEFAULT_TENANT_SETTINGS,
  options?: Intl.NumberFormatOptions,
): string {
  if (value === null || value === undefined || value === '') return '0';
  const number = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(number)) return String(value);

  try {
    return new Intl.NumberFormat(settings.locale, options).format(number);
  } catch {
    return String(number);
  }
}

export function formatTenantDateTime(
  value: Date | string | null | undefined,
  settings: TenantSettings = DEFAULT_TENANT_SETTINGS,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' },
): string {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  try {
    return new Intl.DateTimeFormat(settings.locale, {
      timeZone: settings.timezone,
      ...options,
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

export function formatTenantDate(
  value: Date | string | null | undefined,
  settings: TenantSettings = DEFAULT_TENANT_SETTINGS,
): string {
  return formatTenantDateTime(value, settings, { dateStyle: 'medium' });
}

