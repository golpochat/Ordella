import type { TenantTheme } from './types';

export const DEFAULT_THEME: TenantTheme = {
  preset: 'light',
  colors: {
    primary: '#0f172a',
    secondary: '#f1f5f9',
    background: '#ffffff',
    surface: '#f8fafc',
  },
  typography: {
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
  },
  logoUrl: null,
  iconUrl: null,
};

export const DARK_THEME_OVERRIDES: Partial<TenantTheme> = {
  preset: 'dark',
  colors: {
    primary: '#f8fafc',
    secondary: '#1e293b',
    background: '#0f172a',
    surface: '#1e293b',
  },
};
