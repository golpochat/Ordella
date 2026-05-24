export type ThemePreset = 'light' | 'dark' | 'custom';

export type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
};

export type ThemeTypography = {
  sm: string;
  md: string;
  lg: string;
};

export type TenantTheme = {
  tenantId?: string;
  preset: ThemePreset;
  colors: ThemeColors;
  typography: ThemeTypography;
  logoUrl: string | null;
  iconUrl: string | null;
};

export type DomainResolveResult = {
  routingSource?: 'custom' | 'subdomain' | 'onboarding';
  tenantId: string;
  tenantName: string;
  slug: string | null;
  theme: TenantTheme | null;
};
