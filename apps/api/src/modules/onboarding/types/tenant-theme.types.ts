export type ThemePreset = 'light' | 'dark' | 'custom';

export type TenantThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
};

export type TenantThemeTypography = {
  sm: string;
  md: string;
  lg: string;
};

export type TenantThemeConfig = {
  preset: ThemePreset;
  colors: TenantThemeColors;
  typography: TenantThemeTypography;
  iconUrl?: string | null;
};

export type ResolvedTenantTheme = TenantThemeConfig & {
  tenantId: string;
  logoUrl: string | null;
  iconUrl: string | null;
};
