export const DEFAULT_CURRENCY = 'EUR' as const;

export const currencySymbols = {
  EUR: '€',
  GBP: '£',
  USD: '$',
} as const;

export type CurrencyCode = keyof typeof currencySymbols;

const SUPPORTED_CURRENCIES: CurrencyCode[] = ['EUR', 'GBP', 'USD'];

export function formatPrice(amount: number, currency: CurrencyCode = DEFAULT_CURRENCY): string {
  const symbol = currencySymbols[currency];
  const formatted = Number.isInteger(amount)
    ? amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return `${symbol}${formatted}`;
}

export function resolveCurrency(param?: string | string[] | null): CurrencyCode {
  const raw = Array.isArray(param) ? param[0] : param;
  const upper = raw?.trim().toUpperCase();

  if (upper && SUPPORTED_CURRENCIES.includes(upper as CurrencyCode)) {
    return upper as CurrencyCode;
  }

  return DEFAULT_CURRENCY;
}
