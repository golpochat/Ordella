'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { applyThemeToElement, DEFAULT_THEME, type TenantTheme } from '@ordella/shared-utils';
import {
  getSystemColorScheme,
  isHighContrastAppearance,
  ODS_APPEARANCE_STORAGE_KEY,
  readStoredAppearance,
  resolveColorScheme,
  storeAppearance,
  type OdsAppearance,
  type OdsColorScheme,
} from './appearance';

export type OdsThemeContextValue = {
  tenantTheme: TenantTheme;
  appearance: OdsAppearance;
  colorScheme: OdsColorScheme;
  highContrast: boolean;
  setAppearance: (value: OdsAppearance) => void;
};

const OdsThemeContext = createContext<OdsThemeContextValue | null>(null);

export function useOdsTheme(): OdsThemeContextValue {
  const ctx = useContext(OdsThemeContext);
  if (!ctx) {
    throw new Error('useOdsTheme must be used within OdsThemeProvider');
  }
  return ctx;
}

/** Safe hook when provider is optional (e.g. marketing). */
export function useOdsThemeOptional(): OdsThemeContextValue | null {
  return useContext(OdsThemeContext);
}

export type OdsThemeProviderProps = {
  theme?: TenantTheme | null;
  children: React.ReactNode;
  /** Initial appearance before hydration (from SSR cookie/localStorage read). */
  defaultAppearance?: OdsAppearance;
};

/**
 * ODS Theme Engine — tenant CSS variables + appearance (light/dark/system/high-contrast).
 */
export function OdsThemeProvider({ theme, children, defaultAppearance }: OdsThemeProviderProps) {
  const tenantTheme = useMemo(() => theme ?? DEFAULT_THEME, [theme]);
  const [appearance, setAppearanceState] = useState<OdsAppearance>(
    defaultAppearance ?? 'system',
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAppearanceState(readStoredAppearance());
    setHydrated(true);
  }, []);

  const colorScheme = useMemo(() => resolveColorScheme(appearance), [appearance]);
  const highContrast = isHighContrastAppearance(appearance);

  const setAppearance = useCallback((value: OdsAppearance) => {
    setAppearanceState(value);
    storeAppearance(value);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    applyThemeToElement(root, tenantTheme, { colorScheme });
    root.dataset.odsAppearance = appearance;
    root.dataset.odsHighContrast = highContrast ? 'true' : 'false';
  }, [tenantTheme, colorScheme, appearance, highContrast]);

  useEffect(() => {
    if (appearance !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const scheme = getSystemColorScheme();
      applyThemeToElement(document.documentElement, tenantTheme, { colorScheme: scheme });
      document.documentElement.dataset.odsColorScheme = scheme;
      document.documentElement.classList.toggle('dark', scheme === 'dark');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [appearance, tenantTheme]);

  const value = useMemo<OdsThemeContextValue>(
    () => ({
      tenantTheme,
      appearance,
      colorScheme,
      highContrast,
      setAppearance,
    }),
    [tenantTheme, appearance, colorScheme, highContrast, setAppearance],
  );

  return (
    <OdsThemeContext.Provider value={value}>
      <span data-ods-theme-hydrated={hydrated ? 'true' : 'false'} hidden />
      {children}
    </OdsThemeContext.Provider>
  );
}

export { ODS_APPEARANCE_STORAGE_KEY };
