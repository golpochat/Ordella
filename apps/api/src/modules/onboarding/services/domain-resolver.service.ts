import { Injectable, NotFoundException } from '@nestjs/common';
import { OnboardingRepository } from '../repositories/onboarding.repositories';
import { ThemeRegistryService } from './theme-registry.service';

/** Placeholder custom-domain map until DNS + tenant_domains table exists */
const PLACEHOLDER_DOMAIN_MAP: Record<string, string> = {};

@Injectable()
export class DomainResolverService {
  constructor(
    private readonly repository: OnboardingRepository,
    private readonly themeRegistry: ThemeRegistryService,
  ) {}

  async resolveByDomain(domain: string): Promise<{
    tenantId: string;
    tenantName: string;
    slug: string | null;
    theme: Awaited<ReturnType<ThemeRegistryService['getTheme']>>;
  }> {
    const host = domain.trim().toLowerCase().replace(/^www\./, '');

    const mappedTenantId = PLACEHOLDER_DOMAIN_MAP[host];
    if (mappedTenantId) {
      const tenant = await this.repository.findTenantById(mappedTenantId);
      if (!tenant) {
        throw new NotFoundException({ code: 'TENANT_NOT_FOUND', message: 'Tenant not found' });
      }
      const theme = await this.themeRegistry.getTheme(tenant.id);
      return { tenantId: tenant.id, tenantName: tenant.name, slug: tenant.slug, theme };
    }

    const subdomain = host.split('.')[0];
    const tenant =
      (await this.repository.findTenantBySubdomain(subdomain)) ??
      (await this.repository.findTenantBySlug(subdomain));
    if (!tenant) {
      throw new NotFoundException({
        code: 'DOMAIN_NOT_MAPPED',
        message: `No tenant mapped for domain "${host}"`,
      });
    }

    const theme = await this.themeRegistry.getTheme(tenant.id);
    return {
      tenantId: tenant.id,
      tenantName: tenant.name,
      slug: tenant.slug,
      theme,
    };
  }
}
