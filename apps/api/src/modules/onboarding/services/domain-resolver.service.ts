import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantRoutingService } from '../../../platform/routing/tenant-routing.service';
import { ThemeRegistryService } from './theme-registry.service';

@Injectable()
export class DomainResolverService {
  constructor(
    private readonly routing: TenantRoutingService,
    private readonly themeRegistry: ThemeRegistryService,
  ) {}

  async resolveByDomain(domain: string): Promise<{
    tenantId: string;
    tenantName: string;
    slug: string | null;
    routingSource: 'custom' | 'subdomain' | 'onboarding';
    theme: Awaited<ReturnType<ThemeRegistryService['getTheme']>> | null;
  }> {
    try {
      const resolved = await this.routing.resolveByDomain(domain);

      if (resolved.routingSource === 'onboarding' || !resolved.tenantId) {
        return {
          tenantId: '',
          tenantName: resolved.tenantName,
          slug: null,
          routingSource: 'onboarding',
          theme: null,
        };
      }

      const theme = await this.themeRegistry.getTheme(resolved.tenantId);
      return { ...resolved, theme };
    } catch {
      throw new NotFoundException({
        code: 'DOMAIN_NOT_MAPPED',
        message: `No tenant mapped for domain "${domain}"`,
      });
    }
  }
}
