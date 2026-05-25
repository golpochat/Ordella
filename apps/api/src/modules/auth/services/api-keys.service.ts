import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { CreateApiKeyDto, RotateApiKeyDto } from '../dto';
import { ApiKeyResponseDto } from '../dto';
import { FilterPaginationDto } from '../dto';
import { TenantContext } from '../../../common/interfaces';
import { ApiKeyEntity } from '../entities';
import { ApiKeyRepository } from '../repositories/api-key.repository';

export type VerifiedApiKey = {
  id: string;
  tenantId: string;
  name: string;
  scopes: string[];
  keyPrefix: string;
};

const KEY_PREFIX = 'ord_live';
const DEFAULT_SCOPES = ['orders.read', 'catalog.read', 'inventory.read', 'customers.read', 'locations.read'];

@Injectable()
export class ApiKeysService {
  constructor(private readonly apiKeys: ApiKeyRepository) {}

  async findAll(tenant: TenantContext, query: FilterPaginationDto): Promise<ApiKeyResponseDto[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const keys = await this.apiKeys.listForTenant(tenant.tenantId, (page - 1) * limit, limit);
    return keys.map((key) => this.toDto(key));
  }

  async create(tenant: TenantContext, dto: CreateApiKeyDto): Promise<ApiKeyResponseDto> {
    const token = this.generateToken();
    const key = await this.apiKeys.save(
      this.apiKeys.create({
        tenantId: tenant.tenantId,
        name: dto.name.trim(),
        keyPrefix: this.extractPrefix(token),
        keyHash: this.hashToken(token),
        scopes: dto.scopes?.length ? dto.scopes : DEFAULT_SCOPES,
        expiresAt: null,
        lastUsedAt: null,
        isActive: true,
        revokedAt: null,
      }),
    );
    return { ...this.toDto(key), key: token };
  }

  async rotate(tenant: TenantContext, id: string, dto: RotateApiKeyDto): Promise<ApiKeyResponseDto> {
    const existing = await this.requireForTenant(tenant.tenantId, id);
    if (!existing.isActive || existing.revokedAt) throw new BadRequestException('API key is revoked');
    const token = this.generateToken();
    existing.keyPrefix = this.extractPrefix(token);
    existing.keyHash = this.hashToken(token);
    existing.scopes = dto.scopes?.length ? dto.scopes : existing.scopes;
    existing.lastUsedAt = null;
    const saved = await this.apiKeys.save(existing);
    return { ...this.toDto(saved), key: token };
  }

  async revoke(tenant: TenantContext, id: string): Promise<ApiKeyResponseDto> {
    const key = await this.requireForTenant(tenant.tenantId, id);
    key.isActive = false;
    key.revokedAt = new Date();
    return this.toDto(await this.apiKeys.save(key));
  }

  async remove(tenant: TenantContext, id: string): Promise<void> {
    await this.revoke(tenant, id);
  }

  async verify(rawToken: string): Promise<VerifiedApiKey> {
    const prefix = this.extractPrefix(rawToken);
    const key = await this.apiKeys.findByPrefix(prefix);
    if (!key || !key.isActive || key.revokedAt || (key.expiresAt && key.expiresAt.getTime() < Date.now())) {
      throw new UnauthorizedException('Invalid API key');
    }
    if (!this.matchesHash(rawToken, key.keyHash)) {
      throw new UnauthorizedException('Invalid API key');
    }
    key.lastUsedAt = new Date();
    await this.apiKeys.save(key);
    return {
      id: key.id,
      tenantId: key.tenantId,
      name: key.name,
      scopes: key.scopes,
      keyPrefix: key.keyPrefix,
    };
  }

  private async requireForTenant(tenantId: string, id: string): Promise<ApiKeyEntity> {
    const key = await this.apiKeys.findByIdForTenant(tenantId, id);
    if (!key) throw new NotFoundException('API key not found');
    return key;
  }

  private toDto(key: ApiKeyEntity): ApiKeyResponseDto {
    return {
      id: key.id,
      tenantId: key.tenantId,
      name: key.name,
      keyPrefix: key.keyPrefix,
      scopes: key.scopes,
      isActive: key.isActive && !key.revokedAt,
      expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
    };
  }

  private generateToken(): string {
    const prefix = randomBytes(6).toString('hex');
    const secret = randomBytes(24).toString('base64url');
    return `${KEY_PREFIX}_${prefix}_${secret}`;
  }

  private extractPrefix(token: string): string {
    const parts = token.split('_');
    if (parts.length < 4 || `${parts[0]}_${parts[1]}` !== KEY_PREFIX) {
      throw new UnauthorizedException('Invalid API key');
    }
    return parts[2];
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private matchesHash(token: string, storedHash: string): boolean {
    const actual = Buffer.from(this.hashToken(token), 'hex');
    const expected = Buffer.from(storedHash, 'hex');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }
}
