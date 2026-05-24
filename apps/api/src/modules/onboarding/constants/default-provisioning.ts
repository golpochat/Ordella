export const DEFAULT_CURRENCY = 'EUR';
export const DEFAULT_LOCALE = 'en-IE';
export const DEFAULT_TIMEZONE = 'Europe/Dublin';
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
