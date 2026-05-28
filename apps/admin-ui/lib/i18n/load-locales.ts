import type { LocaleBundleLoader, OdsLocale } from '@shared-ui';

/** Code-split locale bundles — missing keys fall back to English in I18nProvider. */
export const adminLocaleLoaders: Partial<Record<OdsLocale, LocaleBundleLoader>> = {
  fr: () => import('@/locales/fr.json'),
  de: () => import('@/locales/de.json'),
  es: () => import('@/locales/es.json'),
  ar: () => import('@/locales/ar.json'),
  zh: () => import('@/locales/zh.json'),
};
