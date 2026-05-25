export type ThemePreset = 'light' | 'dark' | 'custom';
export type BaseTheme = 'default' | 'modern' | 'minimal' | 'bold';

export type ThemeColors = {
  primary: string;
  secondary: string;
  accent?: string;
  background: string;
  surface: string;
  text?: string;
};

export type ThemeTypography = {
  sm: string;
  md: string;
  lg: string;
  headingFont?: string;
  bodyFont?: string;
  fontSizes?: Record<string, string>;
};

export type ThemeLayout = {
  cardStyle?: 'rounded' | 'square';
  spacingScale?: 'compact' | 'comfortable' | 'spacious';
  buttonStyle?: 'rounded' | 'square' | 'pill';
  headerLayout?: 'centered' | 'left-aligned';
};

export type HomepageSection = {
  type: 'hero' | 'categories' | 'featuredItems' | 'banner' | 'custom';
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  href?: string;
  imageUrl?: string | null;
  limit?: number;
  html?: string;
};

export type ThemeAssets = {
  logo?: string | null;
  banner?: string | null;
  background?: string | null;
  favicon?: string | null;
};

export type TenantTheme = {
  tenantId?: string;
  id?: string;
  name?: string;
  baseTheme?: BaseTheme;
  preset: ThemePreset;
  colors: ThemeColors;
  typography: ThemeTypography;
  layout?: ThemeLayout;
  homepageSections?: HomepageSection[];
  assets?: ThemeAssets;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    openGraphImage?: string | null;
  };
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
