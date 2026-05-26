import {
  DEFAULT_TENANT_SETTINGS,
  formatTenantCurrency,
  formatTenantDate,
  type TenantSettings,
} from '@shared-utils';

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

export function formatMoney(
  value: string | number,
  settings: TenantSettings = DEFAULT_TENANT_SETTINGS,
): string {
  return formatTenantCurrency(value, settings);
}

export function formatDate(
  value?: string | null,
  settings: TenantSettings = DEFAULT_TENANT_SETTINGS,
): string {
  if (!value) return 'Not set';
  return formatTenantDate(value, settings);
}
