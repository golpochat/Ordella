import type { OdsLocale } from './types';

export function createFormatters(locale: OdsLocale, currency = 'EUR', timeZone?: string) {
  const formatDate = (
    value: Date | string | number | undefined,
    options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  ): string => {
    if (value === undefined || value === null || value === '') return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(locale, { timeZone, ...options }).format(date);
  };

  const formatTime = (
    value: Date | string | number | undefined,
    options: Intl.DateTimeFormatOptions = { timeStyle: 'short' },
  ): string => {
    if (value === undefined || value === null || value === '') return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(locale, { timeZone, ...options }).format(date);
  };

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string =>
    new Intl.NumberFormat(locale, options).format(value);

  const formatCurrency = (
    value: number,
    code = currency,
    options?: Intl.NumberFormatOptions,
  ): string => new Intl.NumberFormat(locale, { style: 'currency', currency: code, ...options }).format(value);

  const formatRelativeTime = (
    value: Date | string | number,
    unit: Intl.RelativeTimeFormatUnit = 'day',
  ): string => {
    const date = value instanceof Date ? value : new Date(value);
    const diffMs = date.getTime() - Date.now();
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const absMs = Math.abs(diffMs);
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (unit === 'day' || absMs >= day) {
      return rtf.format(Math.round(diffMs / day), 'day');
    }
    if (absMs >= hour) {
      return rtf.format(Math.round(diffMs / hour), 'hour');
    }
    return rtf.format(Math.round(diffMs / minute), 'minute');
  };

  const formatList = (items: string[], options?: Intl.ListFormatOptions): string =>
    new Intl.ListFormat(locale, { style: 'long', type: 'conjunction', ...options }).format(items);

  const plural = (forms: { zero?: string; one: string; other: string }, count: number): string => {
    const rules = new Intl.PluralRules(locale);
    const form = rules.select(count);
    const template =
      form === 'one' ? forms.one : form === 'zero' && forms.zero ? forms.zero : forms.other;
    return template.replace(/\{\{count\}\}/g, String(count));
  };

  return { formatDate, formatTime, formatNumber, formatCurrency, formatRelativeTime, formatList, plural };
}
