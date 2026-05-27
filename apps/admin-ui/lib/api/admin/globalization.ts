import type { ApiClient } from '@shared-utils';
import { z } from 'zod';

const settingsSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  baseCurrency: z.string(),
  defaultLocale: z.string(),
  supportedCountries: z.array(z.string()),
  supportedCurrencies: z.array(z.string()),
  dualPricingEnabled: z.boolean(),
  roundingMode: z.enum(['half_up', 'bankers', 'cash']),
  cashRoundingIncrement: z.string(),
  fxProvider: z.string(),
  reportingCurrency: z.string(),
  metadata: z.record(z.unknown()),
  updatedAt: z.string(),
});

const dashboardSchema = z.object({
  settings: settingsSchema,
  fxRatePairs: z.number(),
  countryPriceOverrides: z.number(),
  taxExemptions: z.number(),
  localizedEntries: z.number(),
  complianceProfiles: z.number(),
  engines: z.array(z.string()),
});

const fxRateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  fromCurrency: z.string(),
  toCurrency: z.string(),
  rate: z.string(),
  source: z.string(),
  effectiveAt: z.string(),
  createdAt: z.string(),
});

const priceSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  countryCode: z.string(),
  currency: z.string(),
  productId: z.string().uuid(),
  price: z.string(),
  compareAtPrice: z.string().nullable(),
  taxInclusive: z.boolean(),
  isActive: z.boolean(),
  updatedAt: z.string(),
});

const exemptionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  countryCode: z.string(),
  regionCode: z.string().nullable(),
  exemptionType: z.string(),
  taxId: z.string().nullable(),
  customerId: z.string().uuid().nullable(),
  isActive: z.boolean(),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
});

const complianceSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  countryCode: z.string(),
  invoiceFormat: z.string(),
  privacyRegime: z.string(),
  taxReportTemplate: z.string(),
  invoiceFields: z.record(z.unknown()),
  exportConfig: z.record(z.unknown()),
  updatedAt: z.string(),
});

export type GlobalizationSettings = z.infer<typeof settingsSchema>;
export type GlobalizationDashboard = z.infer<typeof dashboardSchema>;
export type FxRate = z.infer<typeof fxRateSchema>;
export type CountryPrice = z.infer<typeof priceSchema>;
export type TaxExemption = z.infer<typeof exemptionSchema>;
export type ComplianceProfile = z.infer<typeof complianceSchema>;

export async function getGlobalizationDashboard(api: ApiClient) {
  return dashboardSchema.parse(await api.getData<unknown>('globalization/dashboard'));
}

export async function getGlobalizationSettings(api: ApiClient) {
  return z.object({
    settings: settingsSchema,
    tenantLocalization: z.record(z.unknown()).nullable(),
    locationTimezones: z.array(z.object({ id: z.string().uuid(), name: z.string(), timezone: z.string() })),
  }).parse(await api.getData<unknown>('globalization/settings'));
}

export async function updateGlobalizationSettings(
  api: ApiClient,
  body: {
    baseCurrency?: string;
    defaultLocale?: string;
    supportedCountries?: string[];
    supportedCurrencies?: string[];
    dualPricingEnabled?: boolean;
    roundingMode?: 'half_up' | 'bankers' | 'cash';
    reportingCurrency?: string;
  },
) {
  const response = await api.put<{ success: boolean; data: unknown }>('globalization/settings', body);
  return settingsSchema.parse(response.data);
}

export async function listFxRates(api: ApiClient) {
  return z.array(fxRateSchema).parse(await api.getData<unknown>('globalization/fx-rates'));
}

export async function refreshFxRates(api: ApiClient) {
  return z.array(fxRateSchema).parse(await api.postData<unknown>('globalization/fx-rates/refresh', {}));
}

export async function convertCurrency(
  api: ApiClient,
  body: { amount: number; fromCurrency: string; toCurrency: string; context?: string },
) {
  return z.record(z.unknown()).parse(await api.postData<unknown>('globalization/convert', body));
}

export async function listCountryPrices(api: ApiClient, countryCode?: string) {
  return z.array(priceSchema).parse(await api.getData<unknown>('globalization/prices', { params: countryCode ? { countryCode } : undefined }));
}

export async function listTaxExemptions(api: ApiClient) {
  return z.array(exemptionSchema).parse(await api.getData<unknown>('globalization/tax-exemptions'));
}

export async function listComplianceProfiles(api: ApiClient) {
  return z.array(complianceSchema).parse(await api.getData<unknown>('globalization/compliance'));
}

export async function getReportingDashboard(api: ApiClient, params?: { from?: string; to?: string; reportingCurrency?: string }) {
  return z.record(z.unknown()).parse(await api.getData<unknown>('globalization/reporting', { params }));
}
