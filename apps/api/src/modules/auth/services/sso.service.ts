import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { createPublicKey, createVerify, randomBytes } from 'crypto';
import { DataSource, IsNull, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { AuditLogEntity } from '../../audit/entities';
import { TenantMembershipEntity } from '../../onboarding/entities/tenant-membership.entity';
import { hashPassword } from '../../onboarding/utils/password.util';
import { SsoCallbackDto, SsoLoginDto, UpdateRoleMappingsDto, UpsertSsoProviderDto } from '../dto';
import { RoleEntity, SsoProviderEntity, SsoRoleMappingEntity, UserEntity } from '../entities';
import { SsoProviderType } from '../enums/sso-provider-type.enum';
import { UserStatus } from '../enums/user-status.enum';
import { AuthenticationService } from './authentication.service';
import { SsoConfigCryptoService } from './sso-config-crypto.service';

type JwtParts = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signingInput: string;
  signature: Buffer;
};

type FederatedProfile = {
  externalId: string;
  email: string;
  name: string;
  roles: string[];
};

@Injectable()
export class SsoService {
  constructor(
    @InjectRepository(SsoProviderEntity)
    private readonly providers: Repository<SsoProviderEntity>,
    @InjectRepository(SsoRoleMappingEntity)
    private readonly roleMappings: Repository<SsoRoleMappingEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roles: Repository<RoleEntity>,
    @InjectRepository(TenantMembershipEntity)
    private readonly memberships: Repository<TenantMembershipEntity>,
    @InjectRepository(AuditLogEntity)
    private readonly auditLogs: Repository<AuditLogEntity>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly crypto: SsoConfigCryptoService,
    private readonly authentication: AuthenticationService,
  ) {}

  async listProviders(tenant: TenantContext) {
    const providers = await this.providers.find({
      where: { tenantId: tenant.tenantId },
      order: { createdAt: 'DESC' },
    });
    return providers.map((provider) => this.toProviderResponse(provider));
  }

  async createProvider(tenant: TenantContext, dto: UpsertSsoProviderDto) {
    const provider = await this.providers.save(this.providers.create({
      tenantId: tenant.tenantId,
      providerType: dto.providerType,
      clientId: this.emptyToNull(dto.clientId),
      clientSecretEncrypted: this.crypto.encrypt(dto.clientSecret),
      issuerUrl: this.emptyToNull(dto.issuerUrl),
      redirectUrl: this.emptyToNull(dto.redirectUrl),
      metadataUrl: this.emptyToNull(dto.metadataUrl),
      authorizationUrl: this.emptyToNull(dto.authorizationUrl),
      tokenUrl: this.emptyToNull(dto.tokenUrl),
      jwksUri: this.emptyToNull(dto.jwksUri),
      defaultRole: this.normalizeInternalRole(dto.defaultRole),
      isActive: dto.isActive ?? true,
    }));
    await this.recordAudit(tenant.tenantId, 'sso.provider.created', 'sso_provider', provider.id, {
      providerType: provider.providerType,
    });
    return this.toProviderResponse(provider);
  }

  async updateProvider(tenant: TenantContext, dto: UpsertSsoProviderDto) {
    if (!dto.id) throw new NotFoundException('SSO provider not found');
    const provider = await this.requireProvider(tenant.tenantId, dto.id);
    provider.providerType = dto.providerType ?? provider.providerType;
    provider.clientId = dto.clientId !== undefined ? this.emptyToNull(dto.clientId) : provider.clientId;
    if (dto.clientSecret !== undefined) provider.clientSecretEncrypted = this.crypto.encrypt(dto.clientSecret);
    provider.issuerUrl = dto.issuerUrl !== undefined ? this.emptyToNull(dto.issuerUrl) : provider.issuerUrl;
    provider.redirectUrl = dto.redirectUrl !== undefined ? this.emptyToNull(dto.redirectUrl) : provider.redirectUrl;
    provider.metadataUrl = dto.metadataUrl !== undefined ? this.emptyToNull(dto.metadataUrl) : provider.metadataUrl;
    provider.authorizationUrl = dto.authorizationUrl !== undefined ? this.emptyToNull(dto.authorizationUrl) : provider.authorizationUrl;
    provider.tokenUrl = dto.tokenUrl !== undefined ? this.emptyToNull(dto.tokenUrl) : provider.tokenUrl;
    provider.jwksUri = dto.jwksUri !== undefined ? this.emptyToNull(dto.jwksUri) : provider.jwksUri;
    provider.defaultRole = dto.defaultRole !== undefined ? this.normalizeInternalRole(dto.defaultRole) : provider.defaultRole;
    provider.isActive = dto.isActive ?? provider.isActive;
    const saved = await this.providers.save(provider);
    await this.recordAudit(tenant.tenantId, 'sso.provider.updated', 'sso_provider', provider.id, {
      providerType: provider.providerType,
      isActive: provider.isActive,
    });
    return this.toProviderResponse(saved);
  }

  async startLogin(tenant: TenantContext, dto: SsoLoginDto) {
    const provider = dto.providerId
      ? await this.requireProvider(tenant.tenantId, dto.providerId)
      : await this.providers.findOne({ where: { tenantId: tenant.tenantId, isActive: true }, order: { createdAt: 'DESC' } });
    if (!provider?.isActive) throw new NotFoundException('Active SSO provider not found');
    const nonce = randomBytes(16).toString('base64url');
    const state = await this.jwtService.signAsync(
      {
        type: 'sso_state',
        tenantId: tenant.tenantId,
        providerId: provider.id,
        nonce,
        redirectUrl: dto.redirectUrl ?? provider.redirectUrl,
      },
      { expiresIn: '10m' },
    );
    return {
      providerId: provider.id,
      providerType: provider.providerType,
      authorizationUrl: await this.buildAuthorizationUrl(provider, state, nonce),
      state,
      nonce,
    };
  }

  async handleCallback(tenant: TenantContext, dto: SsoCallbackDto) {
    const provider = await this.requireProvider(tenant.tenantId, dto.providerId);
    if (!provider.isActive) throw new UnauthorizedException('SSO provider is disabled');
    const state = await this.verifyState(dto.state, provider.id, tenant.tenantId);
    try {
      const idToken = dto.idToken ?? (dto.code ? await this.exchangeAuthorizationCode(provider, dto.code) : undefined);
      const profile = provider.providerType === SsoProviderType.SAML
        ? await this.validateSaml(provider, dto.samlResponse)
        : await this.validateOidc(provider, idToken, dto.nonce ?? state?.nonce);
      const user = await this.upsertFederatedUser(tenant.tenantId, provider, profile);
      await this.recordAudit(tenant.tenantId, 'sso.login.succeeded', 'user', user.id, {
        providerId: provider.id,
        roles: profile.roles,
      });
      return this.authentication.issueTokensForUser(user);
    } catch (error) {
      await this.recordAudit(tenant.tenantId, 'sso.login.failed', 'sso_provider', provider.id, {
        reason: error instanceof Error ? error.message : 'unknown',
      });
      throw error;
    }
  }

  async listRoleMappings(tenant: TenantContext) {
    return this.roleMappings.find({
      where: { tenantId: tenant.tenantId },
      relations: { provider: true },
      order: { externalRole: 'ASC' },
    });
  }

  async updateRoleMappings(tenant: TenantContext, dto: UpdateRoleMappingsDto) {
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(SsoRoleMappingEntity).delete({ tenantId: tenant.tenantId });
      if (!dto.mappings.length) return;
      for (const mapping of dto.mappings) {
        if (mapping.providerId) await this.requireProvider(tenant.tenantId, mapping.providerId);
        await this.requireInternalRole(tenant.tenantId, mapping.internalRole);
      }
      await manager.getRepository(SsoRoleMappingEntity).save(dto.mappings.map((mapping) =>
        manager.getRepository(SsoRoleMappingEntity).create({
          tenantId: tenant.tenantId,
          providerId: mapping.providerId ?? null,
          externalRole: mapping.externalRole.trim(),
          internalRole: this.normalizeInternalRole(mapping.internalRole) ?? 'staff',
        }),
      ));
    });
    await this.recordAudit(tenant.tenantId, 'sso.role_mapping.updated', 'sso_role_mapping', null, {
      count: dto.mappings.length,
    });
    return this.listRoleMappings(tenant);
  }

  async listFederatedUsers(tenant: TenantContext) {
    const users = await this.users.find({
      where: { tenantId: tenant.tenantId },
      relations: { role: true },
      order: { lastLoginAt: 'DESC', name: 'ASC' },
      take: 100,
    });
    return users
      .filter((user) => user.externalId || (user.federatedRoles ?? []).length)
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role?.name ?? null,
        externalId: user.externalId,
        federatedRoles: user.federatedRoles ?? [],
        lastLoginAt: user.lastLoginAt,
        status: user.status,
      }));
  }

  async resetUserOverrides(tenant: TenantContext, userId: string) {
    const user = await this.users.findOne({ where: { id: userId, tenantId: tenant.tenantId }, relations: { role: true } });
    if (!user) throw new NotFoundException('Staff member not found');
    user.externalId = null;
    user.federatedRoles = [];
    user.lastLoginAt = null;
    await this.users.save(user);
    await this.recordAudit(tenant.tenantId, 'sso.user_override.reset', 'user', user.id);
    return user;
  }

  private async upsertFederatedUser(tenantId: string, provider: SsoProviderEntity, profile: FederatedProfile) {
    const role = await this.resolveRole(tenantId, provider, profile.roles);
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(UserEntity);
      let user = await repo.findOne({
        where: [
          { tenantId, externalId: profile.externalId },
          { tenantId, email: profile.email },
        ],
        relations: { role: true },
      });
      if (!user) {
        user = repo.create({
          tenantId,
          name: profile.name,
          email: profile.email,
          passwordHash: await hashPassword(randomBytes(24).toString('base64url')),
          roleId: role.id,
          mfaEnabled: false,
          status: UserStatus.ACTIVE,
        });
      }
      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Federated staff account is disabled');
      }
      user.name = user.name || profile.name;
      user.externalId = profile.externalId;
      user.federatedRoles = profile.roles;
      user.lastLoginAt = new Date();
      user.roleId = role.id;
      const saved = await repo.save(user);
      await manager.getRepository(TenantMembershipEntity).upsert({
        tenantId,
        userId: saved.id,
        roleId: role.id,
        isActive: true,
      }, ['tenantId', 'userId']);
      return repo.findOneOrFail({ where: { id: saved.id, tenantId }, relations: { role: true } });
    });
  }

  private async resolveRole(tenantId: string, provider: SsoProviderEntity, externalRoles: string[]) {
    const mappings = await this.roleMappings.find({
      where: [
        { tenantId, providerId: provider.id },
        { tenantId, providerId: IsNull() },
      ],
    });
    const normalizedExternal = externalRoles.map((role) => role.trim().toLowerCase());
    const mapped = mappings.find((mapping) => normalizedExternal.includes(mapping.externalRole.trim().toLowerCase()));
    const roleName = mapped?.internalRole ?? provider.defaultRole ?? 'staff';
    return this.requireInternalRole(tenantId, roleName);
  }

  private async requireInternalRole(tenantId: string, roleName: string) {
    const normalized = this.normalizeInternalRole(roleName) ?? 'staff';
    const role = await this.roles
      .createQueryBuilder('role')
      .where('role.tenant_id = :tenantId', { tenantId })
      .andWhere('LOWER(role.name) = :name', { name: normalized.toLowerCase() })
      .getOne();
    if (!role) throw new BadRequestException(`Internal role "${roleName}" does not exist for this tenant`);
    return role;
  }

  private async validateOidc(provider: SsoProviderEntity, idToken?: string, nonce?: string): Promise<FederatedProfile> {
    if (!idToken) throw new UnauthorizedException('OIDC id_token is required');
    const parts = this.parseJwt(idToken);
    if (parts.header.alg !== 'RS256') throw new UnauthorizedException('Unsupported OIDC signing algorithm');
    const jwks = await this.loadJwks(provider);
    const key = (jwks.keys as Array<Record<string, unknown>> | undefined)?.find((candidate) => candidate.kid === parts.header.kid);
    if (!key) throw new UnauthorizedException('OIDC signing key not found');
    const verify = createVerify('RSA-SHA256');
    verify.update(parts.signingInput);
    verify.end();
    if (!verify.verify(createPublicKey({ key, format: 'jwk' }), parts.signature)) {
      throw new UnauthorizedException('OIDC token signature is invalid');
    }
    const now = Math.floor(Date.now() / 1000);
    if (Number(parts.payload.exp ?? 0) <= now) throw new UnauthorizedException('OIDC token is expired');
    if (parts.payload.nbf && Number(parts.payload.nbf) > now) throw new UnauthorizedException('OIDC token is not active yet');
    if (provider.issuerUrl && this.trimSlash(String(parts.payload.iss)) !== this.trimSlash(provider.issuerUrl)) {
      throw new UnauthorizedException('OIDC issuer mismatch');
    }
    const audience = Array.isArray(parts.payload.aud) ? parts.payload.aud : [parts.payload.aud];
    if (provider.clientId && !audience.includes(provider.clientId)) {
      throw new UnauthorizedException('OIDC audience mismatch');
    }
    if (nonce && parts.payload.nonce && parts.payload.nonce !== nonce) {
      throw new UnauthorizedException('OIDC nonce mismatch');
    }
    const email = String(parts.payload.email ?? parts.payload.upn ?? parts.payload.preferred_username ?? '').trim().toLowerCase();
    if (!email) throw new UnauthorizedException('OIDC token did not include an email');
    return {
      externalId: String(parts.payload.sub),
      email,
      name: String(parts.payload.name ?? email),
      roles: this.extractRoles(parts.payload),
    };
  }

  private async exchangeAuthorizationCode(provider: SsoProviderEntity, code: string): Promise<string> {
    if (!provider.tokenUrl || !provider.clientId || !provider.redirectUrl) {
      throw new BadRequestException('SSO provider token URL, client ID, and redirect URL are required for authorization code login');
    }
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: provider.clientId,
      redirect_uri: provider.redirectUrl,
    });
    const clientSecret = this.crypto.decrypt(provider.clientSecretEncrypted);
    if (clientSecret) body.set('client_secret', clientSecret);
    const response = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const payload = await response.json().catch(() => null) as { id_token?: string; error_description?: string } | null;
    if (!response.ok || !payload?.id_token) {
      throw new UnauthorizedException(payload?.error_description ?? 'SSO token exchange failed');
    }
    return payload.id_token;
  }

  private async validateSaml(provider: SsoProviderEntity, samlResponse?: string): Promise<FederatedProfile> {
    if (!samlResponse) throw new UnauthorizedException('SAML response is required');
    const xml = Buffer.from(samlResponse, 'base64').toString('utf8');
    if (!xml.includes('Signature')) throw new UnauthorizedException('SAML response must be signed');
    if (provider.issuerUrl && !xml.includes(provider.issuerUrl)) throw new UnauthorizedException('SAML issuer mismatch');
    const email = this.extractXmlValue(xml, 'EmailAddress') ?? this.extractXmlValue(xml, 'email') ?? this.extractXmlValue(xml, 'NameID');
    if (!email) throw new UnauthorizedException('SAML assertion did not include an email');
    return {
      externalId: this.extractXmlValue(xml, 'NameID') ?? email,
      email: email.trim().toLowerCase(),
      name: this.extractXmlValue(xml, 'displayName') ?? email,
      roles: this.extractSamlRoles(xml),
    };
  }

  private async buildAuthorizationUrl(provider: SsoProviderEntity, state: string, nonce: string) {
    if (provider.providerType === SsoProviderType.SAML) {
      return provider.metadataUrl ?? provider.issuerUrl ?? '';
    }
    const authorizationUrl = provider.authorizationUrl ?? (provider.issuerUrl ? `${this.trimSlash(provider.issuerUrl)}/authorize` : null);
    if (!authorizationUrl || !provider.clientId || !provider.redirectUrl) {
      throw new BadRequestException('SSO provider authorization URL, client ID, and redirect URL are required');
    }
    const url = new URL(authorizationUrl);
    url.searchParams.set('client_id', provider.clientId);
    url.searchParams.set('redirect_uri', provider.redirectUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('state', state);
    url.searchParams.set('nonce', nonce);
    return url.toString();
  }

  private async loadJwks(provider: SsoProviderEntity): Promise<Record<string, unknown>> {
    let jwksUri = provider.jwksUri;
    if (!jwksUri && provider.issuerUrl) {
      const discovery = await fetch(`${this.trimSlash(provider.issuerUrl)}/.well-known/openid-configuration`).then((res) => res.json() as Promise<{ jwks_uri?: string }>);
      jwksUri = discovery.jwks_uri ?? null;
    }
    if (!jwksUri) throw new UnauthorizedException('OIDC JWKS URI is not configured');
    return fetch(jwksUri).then((res) => res.json() as Promise<Record<string, unknown>>);
  }

  private parseJwt(token: string): JwtParts {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !encodedSignature) throw new UnauthorizedException('Invalid OIDC token format');
    return {
      header: JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8')) as Record<string, unknown>,
      payload: JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as Record<string, unknown>,
      signingInput: `${encodedHeader}.${encodedPayload}`,
      signature: Buffer.from(encodedSignature, 'base64url'),
    };
  }

  private async verifyState(state: string | undefined, providerId: string, tenantId: string) {
    if (!state) return null;
    const payload = await this.jwtService.verifyAsync<{ type: string; tenantId: string; providerId: string; nonce?: string }>(state);
    if (payload.type !== 'sso_state' || payload.tenantId !== tenantId || payload.providerId !== providerId) {
      throw new UnauthorizedException('Invalid SSO state');
    }
    return payload;
  }

  private async requireProvider(tenantId: string, providerId: string) {
    const provider = await this.providers.findOne({ where: { id: providerId, tenantId } });
    if (!provider) throw new NotFoundException('SSO provider not found');
    return provider;
  }

  private toProviderResponse(provider: SsoProviderEntity) {
    return {
      id: provider.id,
      tenantId: provider.tenantId,
      providerType: provider.providerType,
      clientId: provider.clientId,
      clientSecretConfigured: Boolean(provider.clientSecretEncrypted),
      issuerUrl: provider.issuerUrl,
      redirectUrl: provider.redirectUrl,
      metadataUrl: provider.metadataUrl,
      authorizationUrl: provider.authorizationUrl,
      tokenUrl: provider.tokenUrl,
      jwksUri: provider.jwksUri,
      defaultRole: provider.defaultRole,
      isActive: provider.isActive,
      createdAt: provider.createdAt,
    };
  }

  private extractRoles(payload: Record<string, unknown>) {
    const values = [payload.roles, payload.groups, payload.role].flatMap((value) => Array.isArray(value) ? value : value ? [value] : []);
    return [...new Set(values.map((value) => String(value)).filter(Boolean))];
  }

  private extractSamlRoles(xml: string) {
    const matches = [...xml.matchAll(/<[^>]*(?:AttributeValue)[^>]*>([^<]+)<\/[^>]*AttributeValue>/gi)];
    return [...new Set(matches.map((match) => match[1].trim()).filter(Boolean))];
  }

  private extractXmlValue(xml: string, name: string) {
    const match = new RegExp(`<[^>]*(?:${name})[^>]*>([^<]+)<\\/[^>]*(?:${name})>`, 'i').exec(xml);
    return match?.[1]?.trim() ?? null;
  }

  private normalizeInternalRole(role?: string | null) {
    const normalized = role?.trim();
    if (!normalized) return null;
    const lookup: Record<string, string> = {
      admin: 'admin',
      manager: 'manager',
      staff: 'staff',
      picker: 'fulfillment',
      fulfillment: 'fulfillment',
      driver: 'driver',
      accountant: 'manager',
      'franchise owner': 'owner',
      owner: 'owner',
      'hq admin': 'FranchiseHQ',
      franchisehq: 'FranchiseHQ',
    };
    return lookup[normalized.toLowerCase()] ?? normalized;
  }

  private emptyToNull(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed || null;
  }

  private trimSlash(value: string) {
    return value.replace(/\/+$/, '');
  }

  private async recordAudit(
    tenantId: string,
    action: string,
    entityType: string,
    entityId?: string | null,
    metadata: Record<string, unknown> = {},
  ) {
    await this.auditLogs.save(this.auditLogs.create({
      tenantId,
      action,
      entityType,
      entityId: entityId ?? null,
      metadata,
    }));
  }
}
