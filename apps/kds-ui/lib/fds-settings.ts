const FDS_SETTINGS_KEY = 'ordella.fds.settings';

export type FdsLocalSettings = {
  soundAlerts: boolean;
  darkMode: boolean;
  showCompleted: boolean;
  showCustomerInfo: boolean;
  fulfillmentModeFilter: 'all' | 'pickup' | 'delivery' | 'in_store';
};

export const DEFAULT_FDS_SETTINGS: FdsLocalSettings = {
  soundAlerts: true,
  darkMode: false,
  showCompleted: false,
  showCustomerInfo: true,
  fulfillmentModeFilter: 'all',
};

export function loadFdsSettings(): FdsLocalSettings {
  if (typeof window === 'undefined') return DEFAULT_FDS_SETTINGS;
  const raw = localStorage.getItem(FDS_SETTINGS_KEY);
  if (!raw) return DEFAULT_FDS_SETTINGS;
  try {
    return { ...DEFAULT_FDS_SETTINGS, ...(JSON.parse(raw) as Partial<FdsLocalSettings>) };
  } catch {
    return DEFAULT_FDS_SETTINGS;
  }
}

export function saveFdsSettings(settings: FdsLocalSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FDS_SETTINGS_KEY, JSON.stringify(settings));
}
