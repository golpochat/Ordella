import { z } from 'zod';
import { DARK_THEME_OVERRIDES, DEFAULT_THEME } from './default-theme';
import type { BaseTheme, HomepageSection, PosTheme, TenantTheme, ThemePreset } from './types';

const themePresetSchema = z.enum(['light', 'dark', 'custom']);
const baseThemeSchema = z.enum(['default', 'modern', 'minimal', 'bold']);
const homepageSectionSchema = z.object({
  type: z.enum(['hero', 'categories', 'featuredItems', 'banner', 'custom']),
  enabled: z.boolean().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ctaLabel: z.string().optional(),
  href: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  limit: z.number().optional(),
  html: z.string().optional(),
});

const tenantThemeSchema = z.object({
  tenantId: z.string().uuid().optional(),
  id: z.string().optional(),
  name: z.string().optional(),
  baseTheme: baseThemeSchema.optional(),
  preset: themePresetSchema.optional(),
  colors: z
    .object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      accent: z.string().optional(),
      background: z.string().optional(),
      surface: z.string().optional(),
      text: z.string().optional(),
    })
    .optional(),
  typography: z
    .object({
      sm: z.string().optional(),
      md: z.string().optional(),
      lg: z.string().optional(),
      headingFont: z.string().optional(),
      bodyFont: z.string().optional(),
      fontSizes: z.record(z.string()).optional(),
    })
    .optional(),
  layout: z
    .object({
      cardStyle: z.enum(['rounded', 'square']).optional(),
      spacingScale: z.enum(['compact', 'comfortable', 'spacious']).optional(),
      buttonStyle: z.enum(['rounded', 'square', 'pill']).optional(),
      headerLayout: z.enum(['centered', 'left-aligned']).optional(),
      cornerRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional(),
      layoutStyle: z.enum(['classic', 'modern', 'editorial']).optional(),
    })
    .optional(),
  posTheme: z
    .object({
      mode: z.enum(['light', 'dark']).optional(),
      primaryColor: z.string().optional(),
      accentColor: z.string().optional(),
      backgroundColor: z.string().optional(),
      surfaceColor: z.string().optional(),
      textColor: z.string().optional(),
      headingFont: z.string().optional(),
      bodyFont: z.string().optional(),
      density: z.enum(['compact', 'comfortable', 'spacious']).optional(),
      buttonSize: z.enum(['sm', 'md', 'lg']).optional(),
      cornerRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional(),
      logoUrl: z.string().nullable().optional(),
    })
    .optional(),
  homepageSections: z.array(homepageSectionSchema).optional(),
  assets: z
    .object({
      logo: z.string().nullable().optional(),
      banner: z.string().nullable().optional(),
      background: z.string().nullable().optional(),
      favicon: z.string().nullable().optional(),
    })
    .optional(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      openGraphImage: z.string().nullable().optional(),
    })
    .optional(),
  logoUrl: z.string().nullable().optional(),
  iconUrl: z.string().nullable().optional(),
});

export function mergeTheme(base: TenantTheme, override?: Partial<TenantTheme> | null): TenantTheme {
  if (!override) return { ...base };

  const preset = (override.preset ?? base.preset) as ThemePreset;
  const merged: TenantTheme = {
    tenantId: override.tenantId ?? base.tenantId,
    id: override.id ?? base.id,
    name: override.name ?? base.name,
    baseTheme: (override.baseTheme ?? base.baseTheme ?? 'default') as BaseTheme,
    preset,
    colors: { ...base.colors, ...(override.colors ?? {}) },
    typography: { ...base.typography, ...(override.typography ?? {}) },
    layout: { ...(base.layout ?? {}), ...(override.layout ?? {}) },
    posTheme: { ...(base.posTheme ?? DEFAULT_THEME.posTheme), ...(override.posTheme ?? {}) } as PosTheme,
    homepageSections: override.homepageSections ?? base.homepageSections,
    assets: { ...(base.assets ?? {}), ...(override.assets ?? {}) },
    seo: { ...(base.seo ?? {}), ...(override.seo ?? {}) },
    logoUrl: override.logoUrl !== undefined ? override.logoUrl : base.logoUrl,
    iconUrl: override.iconUrl !== undefined ? override.iconUrl : base.iconUrl,
  };

  if (preset === 'dark') {
    return mergeTheme(merged, DARK_THEME_OVERRIDES);
  }

  return merged;
}

export function getTheme(tenantId: string, raw?: unknown): TenantTheme {
  const parsed = tenantThemeSchema.safeParse(raw ?? {});
  const override = parsed.success ? parsed.data : {};

  const theme = mergeTheme(
    {
      ...DEFAULT_THEME,
      tenantId,
    },
    {
      tenantId,
      id: override.id,
      name: override.name,
      baseTheme: override.baseTheme,
      preset: override.preset,
      colors: override.colors
        ? {
            primary: override.colors.primary ?? DEFAULT_THEME.colors.primary,
            secondary: override.colors.secondary ?? DEFAULT_THEME.colors.secondary,
            accent: override.colors.accent ?? DEFAULT_THEME.colors.accent,
            background: override.colors.background ?? DEFAULT_THEME.colors.background,
            surface: override.colors.surface ?? DEFAULT_THEME.colors.surface,
            text: override.colors.text ?? DEFAULT_THEME.colors.text,
          }
        : undefined,
      typography: override.typography
        ? {
            sm: override.typography.sm ?? DEFAULT_THEME.typography.sm,
            md: override.typography.md ?? DEFAULT_THEME.typography.md,
            lg: override.typography.lg ?? DEFAULT_THEME.typography.lg,
            headingFont: override.typography.headingFont ?? DEFAULT_THEME.typography.headingFont,
            bodyFont: override.typography.bodyFont ?? DEFAULT_THEME.typography.bodyFont,
            fontSizes: override.typography.fontSizes ?? DEFAULT_THEME.typography.fontSizes,
          }
        : undefined,
      layout: override.layout,
      posTheme: override.posTheme
        ? {
            mode: override.posTheme.mode ?? DEFAULT_THEME.posTheme!.mode,
            primaryColor: override.posTheme.primaryColor ?? override.colors?.primary ?? DEFAULT_THEME.posTheme!.primaryColor,
            accentColor: override.posTheme.accentColor ?? override.colors?.accent ?? DEFAULT_THEME.posTheme!.accentColor,
            backgroundColor: override.posTheme.backgroundColor ?? DEFAULT_THEME.posTheme!.backgroundColor,
            surfaceColor: override.posTheme.surfaceColor ?? DEFAULT_THEME.posTheme!.surfaceColor,
            textColor: override.posTheme.textColor ?? DEFAULT_THEME.posTheme!.textColor,
            headingFont: override.posTheme.headingFont ?? DEFAULT_THEME.posTheme!.headingFont,
            bodyFont: override.posTheme.bodyFont ?? DEFAULT_THEME.posTheme!.bodyFont,
            density: override.posTheme.density ?? DEFAULT_THEME.posTheme!.density,
            buttonSize: override.posTheme.buttonSize ?? DEFAULT_THEME.posTheme!.buttonSize,
            cornerRadius: override.posTheme.cornerRadius ?? DEFAULT_THEME.posTheme!.cornerRadius,
            logoUrl: override.posTheme.logoUrl ?? override.logoUrl ?? override.assets?.logo ?? null,
          }
        : undefined,
      homepageSections: override.homepageSections as HomepageSection[] | undefined,
      assets: override.assets,
      seo: override.seo,
      logoUrl: override.logoUrl ?? override.assets?.logo ?? null,
      iconUrl: override.iconUrl ?? override.assets?.favicon ?? null,
    },
  );

  return theme;
}

export function parseBrandingPayload(
  tenantId: string,
  payload: {
    logoUrl?: string | null;
    iconUrl?: string | null;
    theme?: Record<string, unknown>;
  },
): TenantTheme {
  const themeJson = payload.theme ?? {};
  const theme = getTheme(tenantId, {
    ...themeJson,
    logoUrl: payload.logoUrl ?? (themeJson.logoUrl as string | null | undefined) ?? null,
    iconUrl:
      payload.iconUrl ?? (themeJson.iconUrl as string | null | undefined) ?? null,
  });
  return theme;
}
