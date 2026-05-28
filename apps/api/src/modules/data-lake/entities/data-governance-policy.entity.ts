import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('data_governance_policies')
@Index(['tenantId', 'policyKey'], { unique: true })
export class DataGovernancePolicyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'policy_key', type: 'varchar', length: 64 })
  policyKey!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 180 })
  displayName!: string;

  @Column({ name: 'retention_days', type: 'int', nullable: true })
  retentionDays!: number | null;

  @Column({ name: 'pii_fields', type: 'text', array: true, default: () => "'{}'" })
  piiFields!: string[];

  @Column({ name: 'masking_strategy', type: 'varchar', length: 32, default: 'hash' })
  maskingStrategy!: 'hash' | 'redact' | 'tokenize';

  @Column({ name: 'gdpr_export_enabled', type: 'boolean', default: true })
  gdprExportEnabled!: boolean;

  @Column({ name: 'audit_data_access', type: 'boolean', default: true })
  auditDataAccess!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
