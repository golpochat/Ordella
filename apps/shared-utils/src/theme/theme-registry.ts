import { z } from 'zod';
import { DARK_THEME_OVERRIDES, DEFAULT_THEME } from './default-theme';
import type { TenantTheme, ThemePreset } from './types';

const themePresetSchema = z.enum(['light', 'dark', 'custom']);

const tenantThemeSchema = z.object({
  tenantId: z.string().uuid().optional(),
  preset: themePresetSchema.optional(),
  colors: z
    .object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      background: z.string().optional(),
      surface: z.string().optional(),
    })
    .optional(),
  typography: z
    .object({
      sm: z.string().optional(),
      md: z.string().optional(),
      lg: z.string().optional(),
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
    preset,
    colors: { ...base.colors, ...(override.colors ?? {}) },
    typography: { ...base.typography, ...(override.typography ?? {}) },
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
      preset: override.preset,
      colors: override.colors
        ? {
            primary: override.colors.primary ?? DEFAULT_THEME.colors.primary,
            secondary: override.colors.secondary ?? DEFAULT_THEME.colors.secondary,
            background: override.colors.background ?? DEFAULT_THEME.colors.background,
            surface: override.colors.surface ?? DEFAULT_THEME.colors.surface,
          }
        : undefined,
      typography: override.typography
        ? {
            sm: override.typography.sm ?? DEFAULT_THEME.typography.sm,
            md: override.typography.md ?? DEFAULT_THEME.typography.md,
            lg: override.typography.lg ?? DEFAULT_THEME.typography.lg,
          }
        : undefined,
      logoUrl: override.logoUrl ?? null,
      iconUrl: override.iconUrl ?? null,
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
