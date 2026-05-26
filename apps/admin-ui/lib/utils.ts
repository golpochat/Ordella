import { DEFAULT_TENANT_SETTINGS, formatTenantCurrency, formatTenantDateTime, type TenantSettings } from '@shared-utils';

export function formatMoney(value: string, settings: TenantSettings = DEFAULT_TENANT_SETTINGS): string {
  return formatTenantCurrency(value, settings);
}

export function formatDate(value: Date | string | undefined, settings: TenantSettings = DEFAULT_TENANT_SETTINGS): string {
  return formatTenantDateTime(value, settings);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}
