import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { TenantEntity } from '../../modules/tenants/entities/tenant.entity';
import { TenantDomainEntity } from '../entities/tenant-domain.entity';
import { loadDeploymentConfig } from '../config/deployment.config';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class TenantRoutingService {
  private readonly logger = new Logger(TenantRoutingService.name);
  private readonly config = loadDeploymentConfig();

  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenants: Repository<TenantEntity>,
    @InjectRepository(TenantDomainEntity)
    private readonly domains: Repository<TenantDomainEntity>,
  ) {}

  async resolveFromRequest(req: Request): Promise<TenantContext | null> {
    const headerTenant = req.headers['x-tenant-id'] as string | undefined;
    if (headerTenant) {
      return this.resolveTenantIdentifier(headerTenant, 'header');
    }

    const host = this.normalizeHost(req.hostname);
    if (!host || this.isOnboardingHost(host)) {
      return null;
    }

    return this.resolveHost(host);
  }

  async resolveHost(host: string): Promise<TenantContext | null> {
    const normalized = this.normalizeHost(host);

    const custom = await this.domains.findOne({
      where: { domain: normalized, verified: true },
    });
    if (custom) {
      return { tenantId: custom.tenantId, source: 'custom' };
    }

    const subdomain = this.extractPlatformSubdomain(normalized);
    if (subdomain) {
      const tenant = await this.findTenantBySlugOrSubdomain(subdomain);
      if (tenant) {
        return { tenantId: tenant.id, source: 'subdomain' };
      }
    }

    return null;
  }

  async resolveByDomain(domain: string): Promise<{
    tenantId: string;
    tenantName: string;
    slug: string | null;
    routingSource: 'custom' | 'subdomain' | 'onboarding';
  }> {
    const host = this.normalizeHost(domain);

    if (this.isOnboardingHost(host)) {
      return {
        tenantId: '',
        tenantName: 'Ordella',
        slug: null,
        routingSource: 'onboarding',
      };
    }

    const custom = await this.domains.findOne({
      where: { domain: host, verified: true },
    });
    if (custom) {
      const tenant = await this.tenants.findOne({ where: { id: custom.tenantId } });
      if (!tenant) {
        throw new Error('Tenant not found for domain');
      }
      return {
        tenantId: tenant.id,
        tenantName: tenant.name,
        slug: tenant.slug,
        routingSource: 'custom',
      };
    }

    const subdomain = this.extractPlatformSubdomain(host);
    if (subdomain) {
      const tenant = await this.findTenantBySlugOrSubdomain(subdomain);
      if (tenant) {
        return {
          tenantId: tenant.id,
          tenantName: tenant.name,
          slug: tenant.slug,
          routingSource: 'subdomain',
        };
      }
    }

    const fallbackSlug = host.split('.')[0];
    const tenant = await this.findTenantBySlugOrSubdomain(fallbackSlug);
    if (tenant) {
      return {
        tenantId: tenant.id,
        tenantName: tenant.name,
        slug: tenant.slug,
        routingSource: 'subdomain',
      };
    }

    throw new Error(`No tenant mapped for domain "${host}"`);
  }

  isOnboardingHost(host: string): boolean {
    const onboarding = this.normalizeHost(this.config.onboardingHost);
    const admin = this.normalizeHost(this.config.adminHost);
    return host === onboarding || host === admin || host === 'localhost';
  }

  normalizeHost(host: string): string {
    return host.trim().toLowerCase().replace(/^www\./, '');
  }

  private extractPlatformSubdomain(host: string): string | undefined {
    const base = this.normalizeHost(this.config.platformBaseDomain);
    if (host === base) {
      return undefined;
    }
    if (host.endsWith(`.${base}`)) {
      const sub = host.slice(0, -(base.length + 1));
      if (sub && !sub.includes('.')) {
        return sub;
      }
    }
    return undefined;
  }

  private async resolveTenantIdentifier(
    identifier: string,
    source: TenantContext['source'],
  ): Promise<TenantContext | null> {
    if (UUID_RE.test(identifier)) {
      return { tenantId: identifier, source };
    }
    const tenant = await this.findTenantBySlugOrSubdomain(identifier);
    if (!tenant) {
      this.logger.debug(`Unknown tenant identifier: ${identifier}`);
      return null;
    }
    return { tenantId: tenant.id, source };
  }

  private async findTenantBySlugOrSubdomain(slug: string): Promise<TenantEntity | null> {
    return (
      (await this.tenants.findOne({ where: { subdomain: slug } })) ??
      (await this.tenants.findOne({ where: { slug } }))
    );
  }
}
