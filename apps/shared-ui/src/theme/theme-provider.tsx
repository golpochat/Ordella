'use client';

import { createContext, useContext, useEffect, useMemo } from 'react';
import { applyThemeToElement, DEFAULT_THEME, type TenantTheme } from '@ordella/shared-utils';

const ThemeContext = createContext<TenantTheme>(DEFAULT_THEME);

export function useTheme(): TenantTheme {
  return useContext(ThemeContext);
}

export type ThemeProviderProps = {
  theme?: TenantTheme | null;
  children: React.ReactNode;
};

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const resolved = useMemo(() => theme ?? DEFAULT_THEME, [theme]);

  useEffect(() => {
    applyThemeToElement(document.documentElement, resolved);
  }, [resolved]);

  return <ThemeContext.Provider value={resolved}>{children}</ThemeContext.Provider>;
}
