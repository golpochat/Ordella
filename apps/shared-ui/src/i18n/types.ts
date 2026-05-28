/** BCP 47 locale codes supported by ODS. */
export type OdsLocale = 'en' | 'fr' | 'de' | 'es' | 'ar' | 'zh';

export const ODS_LOCALES: OdsLocale[] = ['en', 'fr', 'de', 'es', 'ar', 'zh'];

export const ODS_DEFAULT_LOCALE: OdsLocale = 'en';

export const ODS_RTL_LOCALES: OdsLocale[] = ['ar'];

export type TranslationValue = string | TranslationTree;

export type TranslationTree = {
  [key: string]: TranslationValue;
};

export type TranslationParams = Record<string, string | number | boolean | undefined>;

export type OdsLocaleContextValue = {
  locale: OdsLocale;
  direction: 'ltr' | 'rtl';
  messages: TranslationTree;
  setLocale: (locale: OdsLocale) => void;
  t: (key: string, params?: TranslationParams) => string;
  formatDate: (value: Date | string | number | undefined, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (value: Date | string | number | undefined, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency?: string, options?: Intl.NumberFormatOptions) => string;
  formatRelativeTime: (value: Date | string | number, unit?: Intl.RelativeTimeFormatUnit) => string;
  formatList: (items: string[], options?: Intl.ListFormatOptions) => string;
  plural: (key: string, count: number, params?: TranslationParams) => string;
};
