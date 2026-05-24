import { Injectable } from '@nestjs/common';
import { DEFAULT_RESOLVED_THEME, DARK_PRESET_OVERRIDES } from '../constants/default-theme';
import { TenantBrandingEntity } from '../entities';
import {
  ResolvedTenantTheme,
  TenantThemeConfig,
  ThemePreset,
} from '../types/tenant-theme.types';
import { OnboardingRepository } from '../repositories/onboarding.repositories';

@Injectable()
export class ThemeRegistryService {
  constructor(private readonly repository: OnboardingRepository) {}

  async getTheme(tenantId: string): Promise<ResolvedTenantTheme> {
    const branding = await this.repository.findBranding(tenantId);
    return this.resolveFromBranding(tenantId, branding);
  }

  resolveFromBranding(
    tenantId: string,
    branding: TenantBrandingEntity | null,
  ): ResolvedTenantTheme {
    const raw = (branding?.theme ?? {}) as Partial<TenantThemeConfig>;
    const merged = this.mergeTheme(DEFAULT_RESOLVED_THEME, raw);

    return {
      tenantId,
      preset: merged.preset,
      colors: merged.colors,
      typography: merged.typography,
      logoUrl: branding?.logoUrl ?? null,
      iconUrl: raw.iconUrl ?? merged.iconUrl ?? null,
    };
  }

  mergeTheme(
    base: Omit<ResolvedTenantTheme, 'tenantId'>,
    override?: Partial<TenantThemeConfig> | null,
  ): Omit<ResolvedTenantTheme, 'tenantId'> {
    if (!override) {
      return { ...base, logoUrl: base.logoUrl, iconUrl: base.iconUrl };
    }

    const preset = (override.preset ?? base.preset) as ThemePreset;
    const merged: Omit<ResolvedTenantTheme, 'tenantId'> = {
      preset,
      colors: { ...base.colors, ...(override.colors ?? {}) },
      typography: { ...base.typography, ...(override.typography ?? {}) },
      logoUrl: base.logoUrl,
      iconUrl: override.iconUrl ?? base.iconUrl ?? null,
    };

    if (preset === 'dark') {
      return this.mergeTheme(merged, DARK_PRESET_OVERRIDES);
    }

    return merged;
  }
}
