const FDS_SETTINGS_KEY = 'ordella.fds.settings';

export type FdsLocalSettings = {
  soundAlerts: boolean;
  darkMode: boolean;
  showCompleted: boolean;
  showCustomerInfo: boolean;
  fulfillmentModeFilter: 'all' | 'pickup' | 'delivery' | 'in_store';
};

const DEFAULTS: FdsLocalSettings = {
  soundAlerts: true,
  darkMode: false,
  showCompleted: false,
  showCustomerInfo: true,
  fulfillmentModeFilter: 'all',
};

export function loadFdsSettings(): FdsLocalSettings {
  if (typeof window === 'undefined') return DEFAULTS;
  const raw = localStorage.getItem(FDS_SETTINGS_KEY);
  if (!raw) return DEFAULTS;
  try {
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<FdsLocalSettings>) };
  } catch {
    return DEFAULTS;
  }
}

export function saveFdsSettings(settings: FdsLocalSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FDS_SETTINGS_KEY, JSON.stringify(settings));
}
