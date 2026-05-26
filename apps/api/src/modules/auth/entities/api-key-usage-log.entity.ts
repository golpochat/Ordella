import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiKeyEntity } from './api-key.entity';

@Entity('api_key_usage_logs')
@Index(['tenantId', 'apiKeyId', 'createdAt'])
@Index(['tenantId', 'statusCode', 'createdAt'])
export class ApiKeyUsageLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'api_key_id', type: 'uuid' })
  apiKeyId!: string;

  @ManyToOne(() => ApiKeyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'api_key_id' })
  apiKey!: ApiKeyEntity;

  @Column({ type: 'varchar', length: 12 })
  method!: string;

  @Column({ type: 'varchar', length: 512 })
  path!: string;

  @Column({ name: 'status_code', type: 'int', nullable: true })
  statusCode!: number | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string | null;

  @Column({ name: 'rate_limit_per_minute', type: 'int' })
  rateLimitPerMinute!: number;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
