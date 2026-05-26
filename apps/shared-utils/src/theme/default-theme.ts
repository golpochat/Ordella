import type { TenantTheme } from './types';

export const DEFAULT_THEME: TenantTheme = {
  preset: 'light',
  colors: {
    primary: '#0f172a',
    secondary: '#f1f5f9',
    accent: '#0ea5e9',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
  },
  typography: {
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    headingFont: 'Inter, system-ui, sans-serif',
    bodyFont: 'Inter, system-ui, sans-serif',
    fontSizes: { sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.5rem' },
  },
  layout: {
    cardStyle: 'rounded',
    spacingScale: 'comfortable',
    buttonStyle: 'rounded',
    headerLayout: 'left-aligned',
    cornerRadius: 'lg',
    layoutStyle: 'modern',
  },
  posTheme: {
    mode: 'light',
    primaryColor: '#0f172a',
    accentColor: '#0ea5e9',
    backgroundColor: '#ffffff',
    surfaceColor: '#f8fafc',
    textColor: '#0f172a',
    headingFont: 'Inter, system-ui, sans-serif',
    bodyFont: 'Inter, system-ui, sans-serif',
    density: 'comfortable',
    buttonSize: 'lg',
    cornerRadius: 'lg',
    logoUrl: null,
  },
  homepageSections: [
    { type: 'hero', enabled: true, title: 'Shop online', subtitle: 'Browse the catalog and choose pickup or delivery.', ctaLabel: 'Shop now', href: '/catalog' },
    { type: 'categories', enabled: true, title: 'Featured categories', limit: 4 },
    { type: 'featuredItems', enabled: true, title: 'Featured items', limit: 6 },
  ],
  assets: { logo: null, banner: null, background: null, favicon: null },
  seo: {},
  logoUrl: null,
  iconUrl: null,
};

export const DARK_THEME_OVERRIDES: Partial<TenantTheme> = {
  preset: 'dark',
  colors: {
    primary: '#f8fafc',
    secondary: '#1e293b',
    accent: '#38bdf8',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
  },
};
