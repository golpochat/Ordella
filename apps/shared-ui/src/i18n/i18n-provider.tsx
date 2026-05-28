'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createFormatters } from './formatters';
import { readStoredLocale, storeLocale } from './locale-storage';
import { mergeMessages, resolveTranslation } from './resolve';
import {
  ODS_DEFAULT_LOCALE,
  ODS_RTL_LOCALES,
  type OdsLocale,
  type OdsLocaleContextValue,
  type TranslationParams,
  type TranslationTree,
} from './types';

const I18nContext = createContext<OdsLocaleContextValue | null>(null);

export function useTranslation(): OdsLocaleContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return ctx;
}

export function useTranslationOptional(): OdsLocaleContextValue | null {
  return useContext(I18nContext);
}

export type LocaleBundleLoader = () => Promise<{ default: TranslationTree }>;

export type I18nProviderProps = {
  children: React.ReactNode;
  /** English fallback bundle (required). */
  messages: TranslationTree;
  /** Code-split locale loaders. */
  loaders?: Partial<Record<OdsLocale, LocaleBundleLoader>>;
  defaultLocale?: OdsLocale;
  currency?: string;
  timeZone?: string;
  /** Tenant-specific message overrides. */
  tenantMessages?: TranslationTree;
};

export function I18nProvider({
  children,
  messages: enMessages,
  loaders,
  defaultLocale = ODS_DEFAULT_LOCALE,
  currency = 'EUR',
  timeZone,
  tenantMessages,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<OdsLocale>(defaultLocale);
  const [localeMessages, setLocaleMessages] = useState<TranslationTree>({});
  const [ready, setReady] = useState(locale === ODS_DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(readStoredLocale());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const direction = ODS_RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
    root.lang = locale;
    root.dir = direction;
    root.dataset.odsLocale = locale;
    storeLocale(locale);

    if (locale === ODS_DEFAULT_LOCALE) {
      setLocaleMessages({});
      setReady(true);
      return;
    }

    const load = loaders?.[locale];
    if (!load) {
      setLocaleMessages({});
      setReady(true);
      return;
    }

    setReady(false);
    let cancelled = false;
    void load().then((mod) => {
      if (!cancelled) {
        setLocaleMessages(mod.default);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [locale, loaders]);

  const mergedMessages = useMemo(
    () => mergeMessages(mergeMessages(enMessages, localeMessages), tenantMessages),
    [enMessages, localeMessages, tenantMessages],
  );

  const { plural: pluralize, ...intlFormatters } = useMemo(
    () => createFormatters(locale, currency, timeZone),
    [locale, currency, timeZone],
  );

  const t = useCallback(
    (key: string, params?: TranslationParams) =>
      resolveTranslation(mergedMessages, enMessages, key, params),
    [mergedMessages, enMessages],
  );

  const plural = useCallback(
    (key: string, count: number, params?: TranslationParams) => {
      const one = resolveTranslation(mergedMessages, enMessages, `${key}.one`, params);
      const other = resolveTranslation(mergedMessages, enMessages, `${key}.other`, params);
      const zeroKey = `${key}.zero`;
      const zero =
        getNestedOptional(mergedMessages, zeroKey) ?? getNestedOptional(enMessages, zeroKey);
      return pluralize(
        { one, other, zero: typeof zero === 'string' ? zero : undefined },
        count,
      );
    },
    [mergedMessages, enMessages, pluralize],
  );

  const setLocale = useCallback((next: OdsLocale) => {
    setLocaleState(next);
  }, []);

  const direction = ODS_RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';

  const value = useMemo<OdsLocaleContextValue>(
    () => ({
      locale,
      direction,
      messages: mergedMessages,
      setLocale,
      t,
      plural,
      ...intlFormatters,
    }),
    [locale, direction, mergedMessages, setLocale, t, plural, intlFormatters],
  );

  return (
    <I18nContext.Provider value={value}>
      <span data-ods-i18n-ready={ready ? 'true' : 'false'} hidden />
      {children}
    </I18nContext.Provider>
  );
}

function getNestedOptional(tree: TranslationTree, key: string): TranslationTree[string] | undefined {
  const parts = key.split('.');
  let current: TranslationTree[string] | undefined = tree;
  for (const part of parts) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as TranslationTree)[part];
  }
  return current;
}
