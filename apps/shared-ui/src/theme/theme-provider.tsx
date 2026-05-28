'use client';

import { createContext, useContext, useMemo } from 'react';
import { DEFAULT_THEME, type TenantTheme } from '@ordella/shared-utils';
import { OdsThemeProvider, useOdsThemeOptional } from './ods-theme-provider';

const ThemeContext = createContext<TenantTheme>(DEFAULT_THEME);

/** Tenant branding theme (colors, typography). Prefer `useOdsTheme` for appearance. */
export function useTheme(): TenantTheme {
  const ods = useOdsThemeOptional();
  const legacy = useContext(ThemeContext);
  return ods?.tenantTheme ?? legacy;
}

export type ThemeProviderProps = {
  theme?: TenantTheme | null;
  children: React.ReactNode;
};

/** ODS ThemeProvider — tenant tokens + appearance via OdsThemeEngine. */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const resolved = useMemo(() => theme ?? DEFAULT_THEME, [theme]);

  return (
    <OdsThemeProvider theme={resolved}>
      <ThemeContext.Provider value={resolved}>{children}</ThemeContext.Provider>
    </OdsThemeProvider>
  );
}

export { OdsThemeProvider, useOdsTheme, useOdsThemeOptional } from './ods-theme-provider';
export { ThemeSwitcher, type ThemeSwitcherProps } from './theme-switcher';
export {
  ODS_APPEARANCE_STORAGE_KEY,
  ODS_THEME_BOOTSTRAP_SCRIPT,
  readStoredAppearance,
  resolveColorScheme,
  type OdsAppearance,
  type OdsColorScheme,
} from './appearance';
