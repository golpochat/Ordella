'use client';

import { useMemo } from 'react';
import { DEFAULT_TENANT_SETTINGS } from '@shared-utils';
import {
  I18nProvider,
  LocaleSwitcher,
  useTranslation,
  useTranslationOptional,
  type I18nProviderProps,
  type OdsLocale,
  type TranslationTree,
} from '@shared-ui';
import enMessages from '@/locales/en.json';
import { adminLocaleLoaders } from '@/lib/i18n/load-locales';

export {
  I18nProvider,
  LocaleSwitcher,
  useTranslation,
  useTranslationOptional,
  type OdsLocale,
  type TranslationTree,
};

export type AdminI18nProviderProps = {
  children: React.ReactNode;
  tenantMessages?: TranslationTree;
  currency?: string;
  timeZone?: string;
};

/** Admin shell i18n — English bundle + lazy locale chunks + tenant overrides. */
export function AdminI18nProvider({
  children,
  tenantMessages,
  currency = DEFAULT_TENANT_SETTINGS.currency,
  timeZone = DEFAULT_TENANT_SETTINGS.timezone,
}: AdminI18nProviderProps) {
  const props: I18nProviderProps = {
    messages: enMessages as TranslationTree,
    loaders: adminLocaleLoaders,
    tenantMessages,
    currency,
    timeZone,
    children,
  };

  return <I18nProvider {...props} />;
}

export const AdminLocaleSwitcher = LocaleSwitcher;

/** Resolve a nav label key (`nav.{id}`). */
export function useNavLabel(navId: string): string {
  const { t } = useTranslation();
  return t(`nav.${navId}`);
}

/** Locale-aware money formatting using tenant currency + active locale. */
export function useAdminFormatters() {
  const { formatCurrency, formatDate, formatNumber, formatRelativeTime, formatList, locale } =
    useTranslation();

  return useMemo(
    () => ({
      locale,
      formatMoney: (value: string | number, currency?: string) => {
        const amount = typeof value === 'number' ? value : Number.parseFloat(value);
        if (Number.isNaN(amount)) return formatCurrency(0, currency);
        return formatCurrency(amount, currency);
      },
      formatDate,
      formatNumber,
      formatRelativeTime,
      formatList,
    }),
    [formatCurrency, formatDate, formatNumber, formatRelativeTime, formatList, locale],
  );
}

/** Localized generic error message with API fallback. */
export function useErrorMessage(error: unknown): string {
  const { t } = useTranslation();
  if (error instanceof Error && error.message) return error.message;
  return t('error.generic');
}
