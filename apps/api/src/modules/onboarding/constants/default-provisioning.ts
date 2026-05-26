export const DEFAULT_CURRENCY = 'EUR';
export const DEFAULT_CURRENCY_SYMBOL = '€';
export const DEFAULT_LOCALE = 'en-IE';
export const DEFAULT_TIMEZONE = 'Europe/Dublin';
export const DEFAULT_DATE_FORMAT = 'DD/MM/YYYY';
export const DEFAULT_NUMBER_FORMAT = '1,234.56';
export const DEFAULT_COUNTRY = 'IE';
export const DEFAULT_TAX_RATE = '0.0000';
export const DEFAULT_LOCATION_NAME = 'Main Location';

export function defaultTenantMetadata(): Record<string, unknown> {
  return {
    businessName: '',
    businessType: null,
    timezone: DEFAULT_TIMEZONE,
    fulfillmentEnabled: true,
    deliveryEnabled: true,
    pickupEnabled: true,
    catalogInitialized: true,
    catalog: {
      categories: [],
      items: [],
      modifiers: [],
      inventory: [],
    },
  };
}

export function defaultTenantLocalizationSettings() {
  return {
    currency: DEFAULT_CURRENCY,
    currencySymbol: DEFAULT_CURRENCY_SYMBOL,
    locale: DEFAULT_LOCALE,
    timezone: DEFAULT_TIMEZONE,
    dateFormat: DEFAULT_DATE_FORMAT,
    numberFormat: DEFAULT_NUMBER_FORMAT,
    country: DEFAULT_COUNTRY,
    defaultTaxRate: DEFAULT_TAX_RATE,
  };
}

export function defaultOpeningHoursTemplate(): Record<string, unknown> {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return Object.fromEntries(
    days.map((day) => [day, { open: '09:00', close: '18:00', isClosed: day === 'sunday' }]),
  );
}

export function defaultLocationSettings(): Record<string, unknown> {
  return {
    currency: DEFAULT_CURRENCY,
    locale: DEFAULT_LOCALE,
    phone: '',
    fulfillment: {
      pickupEnabled: true,
      deliveryEnabled: true,
    },
    fulfillmentDisplay: {
      autoAcceptOrders: false,
      autoCompleteMinutes: null,
      soundAlerts: true,
      displayMode: 'grid',
      showCustomerInfo: true,
    },
    deliverySettings: {
      radiusKm: 5,
      deliveryFee: 0,
      freeDeliveryThreshold: null,
    },
    deliveryZones: [],
    openingHours: defaultOpeningHoursTemplate(),
  };
}

export function defaultOpeningHoursRows(): Array<{
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
}> {
  return [
    { dayOfWeek: 0, openTime: null, closeTime: null, isClosed: true },
    { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 2, openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 3, openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 4, openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 5, openTime: '09:00', closeTime: '18:00', isClosed: false },
    { dayOfWeek: 6, openTime: '09:00', closeTime: '18:00', isClosed: false },
  ];
}
