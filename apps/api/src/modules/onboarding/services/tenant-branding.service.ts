import { Injectable } from '@nestjs/common';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { TenantBrandingEntity } from '../entities';
import { UpdateBrandingDto } from '../dto/update-branding.dto';
import { ResolvedTenantTheme, TenantThemeConfig } from '../types/tenant-theme.types';
import { OnboardingRepository } from '../repositories/onboarding.repositories';
import { TenantAccessService } from './tenant-access.service';
import { ThemeRegistryService } from './theme-registry.service';

@Injectable()
export class TenantBrandingService {
  constructor(
    private readonly repository: OnboardingRepository,
    private readonly tenantAccess: TenantAccessService,
    private readonly themeRegistry: ThemeRegistryService,
  ) {}

  async getBranding(tenantId: string): Promise<TenantBrandingEntity | null> {
    return this.repository.findBranding(tenantId);
  }

  async getTheme(tenantId: string): Promise<ResolvedTenantTheme> {
    return this.themeRegistry.getTheme(tenantId);
  }

  async updateBranding(
    user: AuthenticatedUser,
    tenant: TenantContext,
    body: UpdateBrandingDto,
  ): Promise<ResolvedTenantTheme> {
    await this.tenantAccess.assertAdmin(user, tenant);
    const existing = await this.repository.findBranding(tenant.tenantId);

    const themePatch = body.theme ? this.themeDtoToConfig(body.theme) : undefined;
    const currentTheme = (existing?.theme ?? {}) as Partial<TenantThemeConfig>;
    const mergedConfig = themePatch
      ? this.themeRegistry.mergeTheme(
          this.themeRegistry.mergeTheme(
            { preset: 'light', colors: currentTheme.colors, typography: currentTheme.typography, logoUrl: null, iconUrl: currentTheme.iconUrl ?? null } as Omit<ResolvedTenantTheme, 'tenantId'>,
            themePatch,
          ),
          null,
        )
      : null;

    if (!existing) {
      await this.repository.saveBranding({
        tenantId: tenant.tenantId,
        theme: (mergedConfig ?? themePatch ?? {}) as unknown as Record<string, unknown>,
        businessInfo: body.businessInfo ?? {},
      });
    } else {
      if (mergedConfig) {
        existing.theme = mergedConfig as unknown as Record<string, unknown>;
      }
      if (body.businessInfo) {
        existing.businessInfo = { ...existing.businessInfo, ...body.businessInfo };
      }
      await this.repository.saveBranding(existing);
    }

    return this.themeRegistry.getTheme(tenant.tenantId);
  }

  async updateLogo(
    user: AuthenticatedUser,
    tenant: TenantContext,
    logoUrl: string,
  ): Promise<ResolvedTenantTheme> {
    await this.tenantAccess.assertAdmin(user, tenant);
    const existing = await this.repository.findBranding(tenant.tenantId);
    if (!existing) {
      await this.repository.saveBranding({
        tenantId: tenant.tenantId,
        logoUrl,
        theme: {},
        businessInfo: {},
      });
    } else {
      existing.logoUrl = logoUrl;
      await this.repository.saveBranding(existing);
    }
    return this.themeRegistry.getTheme(tenant.tenantId);
  }

  async updateIcon(
    user: AuthenticatedUser,
    tenant: TenantContext,
    iconUrl: string,
  ): Promise<ResolvedTenantTheme> {
    await this.tenantAccess.assertAdmin(user, tenant);
    const existing = await this.repository.findBranding(tenant.tenantId);
    const theme = (existing?.theme ?? {}) as Record<string, unknown>;
    theme.iconUrl = iconUrl;

    if (!existing) {
      await this.repository.saveBranding({
        tenantId: tenant.tenantId,
        logoUrl: null,
        theme,
        businessInfo: {},
      });
    } else {
      existing.theme = theme;
      await this.repository.saveBranding(existing);
    }

    return this.themeRegistry.getTheme(tenant.tenantId);
  }

  private themeDtoToConfig(dto: NonNullable<UpdateBrandingDto['theme']>): TenantThemeConfig {
    return {
      preset: dto.preset ?? 'light',
      colors: {
        primary: dto.colors?.primary ?? '#0f172a',
        secondary: dto.colors?.secondary ?? '#f1f5f9',
        background: dto.colors?.background ?? '#ffffff',
        surface: dto.colors?.surface ?? '#f8fafc',
      },
      typography: {
        sm: dto.typography?.sm ?? '0.875rem',
        md: dto.typography?.md ?? '1rem',
        lg: dto.typography?.lg ?? '1.125rem',
      },
      iconUrl: dto.iconUrl ?? null,
    };
  }
}
