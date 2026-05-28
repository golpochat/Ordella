export type OdsAppearance = 'light' | 'dark' | 'system' | 'high-contrast';

export type OdsColorScheme = 'light' | 'dark';

export const ODS_APPEARANCE_STORAGE_KEY = 'ods-appearance';

export function readStoredAppearance(): OdsAppearance {
  if (typeof window === 'undefined') return 'system';
  try {
    const value = window.localStorage.getItem(ODS_APPEARANCE_STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system' || value === 'high-contrast') {
      return value;
    }
  } catch {
    /* ignore */
  }
  return 'system';
}

export function storeAppearance(value: OdsAppearance): void {
  try {
    window.localStorage.setItem(ODS_APPEARANCE_STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
}

export function getSystemColorScheme(): OdsColorScheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveColorScheme(appearance: OdsAppearance): OdsColorScheme {
  if (appearance === 'dark') return 'dark';
  if (appearance === 'light' || appearance === 'high-contrast') return 'light';
  return getSystemColorScheme();
}

export function isHighContrastAppearance(appearance: OdsAppearance): boolean {
  return appearance === 'high-contrast';
}

/** Inline script — runs before paint to avoid theme flash. */
export const ODS_THEME_BOOTSTRAP_SCRIPT = `(function(){try{var a=localStorage.getItem('${ODS_APPEARANCE_STORAGE_KEY}');var scheme='light';if(a==='dark')scheme='dark';else if(a==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)scheme='dark';var root=document.documentElement;root.classList.toggle('dark',scheme==='dark');root.dataset.odsAppearance=a||'system';root.dataset.odsHighContrast=a==='high-contrast'?'true':'false';root.dataset.odsColorScheme=scheme;}catch(e){}})();`;
