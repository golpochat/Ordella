import { ResolvedTenantTheme } from '../types/tenant-theme.types';

export const DEFAULT_RESOLVED_THEME: Omit<ResolvedTenantTheme, 'tenantId'> = {
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

export const DARK_PRESET_OVERRIDES: Partial<ResolvedTenantTheme> = {
  preset: 'dark',
  colors: {
    primary: '#f8fafc',
    secondary: '#1e293b',
    background: '#0f172a',
    surface: '#1e293b',
  },
};
