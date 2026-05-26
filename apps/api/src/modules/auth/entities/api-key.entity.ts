import { Column, Entity, Index } from 'typeorm';
import { BaseTenantEntity } from './base-tenant.entity';

/** Tenant-scoped API keys — API Spec §13.5, SRS tenant-scoped API keys. */
@Entity('api_keys')
@Index(['tenantId', 'keyPrefix'])
export class ApiKeyEntity extends BaseTenantEntity {
  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ name: 'key_prefix', type: 'varchar', length: 16 })
  keyPrefix!: string;

  @Column({ name: 'key_hash', type: 'varchar', length: 255 })
  keyHash!: string;

  @Column({ type: 'jsonb', default: [] })
  scopes!: string[];

  @Column({ name: 'rate_limit_per_minute', type: 'int', default: 1000 })
  rateLimitPerMinute!: number;

  @Column({ name: 'ip_allowlist', type: 'text', array: true, default: () => "'{}'" })
  ipAllowlist!: string[];

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt!: Date | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;
}
