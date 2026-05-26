import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
@Index(['tenantId', 'createdAt'])
@Index(['tenantId', 'entityType', 'createdAt'])
@Index(['tenantId', 'userId', 'createdAt'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId!: string | null;

  @Column({ name: 'actor_type', type: 'varchar', length: 24, default: 'system' })
  actorType!: string;

  @Column({ type: 'varchar', length: 48, default: 'api' })
  source!: string;

  @Column({ type: 'varchar', length: 24, default: 'success' })
  status!: string;

  @Column({ name: 'risk_level', type: 'varchar', length: 16, default: 'low' })
  riskLevel!: string;

  @Column({ name: 'request_id', type: 'varchar', length: 128, nullable: true })
  requestId!: string | null;

  @Column({ type: 'varchar', length: 128 })
  action!: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 64 })
  entityType!: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 128, nullable: true })
  entityId!: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string | null;

  @Column({ name: 'previous_hash', type: 'varchar', length: 128, nullable: true })
  previousHash!: string | null;

  @Column({ name: 'hash', type: 'varchar', length: 128, nullable: true })
  hash!: string | null;

  @Column({ name: 'retention_until', type: 'timestamptz', nullable: true })
  retentionUntil!: Date | null;

  @Column({ name: 'legal_hold', type: 'boolean', default: false })
  legalHold!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
