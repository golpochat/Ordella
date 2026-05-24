import { Injectable } from '@nestjs/common';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { TenantBrandingEntity } from '../entities';
import { OnboardingRepository } from '../repositories/onboarding.repositories';
import { TenantAccessService } from './tenant-access.service';

@Injectable()
export class TenantBrandingService {
  constructor(
    private readonly repository: OnboardingRepository,
    private readonly tenantAccess: TenantAccessService,
  ) {}

  async getBranding(tenantId: string): Promise<TenantBrandingEntity | null> {
    return this.repository.findBranding(tenantId);
  }

  async updateBranding(
    user: AuthenticatedUser,
    tenant: TenantContext,
    body: {
      theme?: Record<string, unknown>;
      businessInfo?: Record<string, unknown>;
    },
  ): Promise<TenantBrandingEntity> {
    await this.tenantAccess.assertAdmin(user, tenant);
    const existing = await this.repository.findBranding(tenant.tenantId);
    if (!existing) {
      return this.repository.saveBranding({
        tenantId: tenant.tenantId,
        theme: body.theme ?? {},
        businessInfo: body.businessInfo ?? {},
      });
    }

    existing.theme = { ...existing.theme, ...(body.theme ?? {}) };
    existing.businessInfo = { ...existing.businessInfo, ...(body.businessInfo ?? {}) };
    return this.repository.saveBranding(existing);
  }

  async updateLogo(
    user: AuthenticatedUser,
    tenant: TenantContext,
    logoUrl: string,
  ): Promise<TenantBrandingEntity> {
    await this.tenantAccess.assertAdmin(user, tenant);
    const existing = await this.repository.findBranding(tenant.tenantId);
    if (!existing) {
      return this.repository.saveBranding({
        tenantId: tenant.tenantId,
        logoUrl,
        theme: {},
        businessInfo: {},
      });
    }
    existing.logoUrl = logoUrl;
    return this.repository.saveBranding(existing);
  }
}
