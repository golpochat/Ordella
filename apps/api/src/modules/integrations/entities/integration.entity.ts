import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { IntegrationStatus } from '../enums/integration-status.enum';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { IntegrationEventEntity } from './integration-event.entity';
import { IntegrationLogEntity } from './integration-log.entity';
import { IntegrationProviderEntity } from './integration-provider.entity';

/** API Spec §13.4 — tenant connected apps */
@Entity('integrations')
@Index(['tenantId', 'providerId'])
export class IntegrationEntity extends BaseTenantScopedEntity {
  @Column({ name: 'provider_id', type: 'uuid' })
  providerId!: string;

  @ManyToOne(() => IntegrationProviderEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'provider_id' })
  provider!: IntegrationProviderEntity;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ name: 'integration_type', type: 'varchar', length: 32, default: 'other' })
  integrationType!: string;

  @Column({ name: 'provider_slug', type: 'varchar', length: 64, nullable: true })
  providerSlug!: string | null;

  @Column({ type: 'varchar', length: 32, default: IntegrationStatus.PENDING })
  status!: IntegrationStatus;

  @Column({ type: 'jsonb', default: {} })
  config!: Record<string, unknown>;

  @Column({ name: 'credentials_ref', type: 'varchar', length: 255, nullable: true })
  credentialsRef!: string | null;

  @Column({ name: 'credential_ciphertext', type: 'text', nullable: true })
  credentialCiphertext!: string | null;

  @Column({ name: 'sync_schedule', type: 'varchar', length: 64, nullable: true })
  syncSchedule!: string | null;

  @Column({ name: 'conflict_resolution', type: 'varchar', length: 32, default: 'provider_wins' })
  conflictResolution!: string;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount!: number;

  @Column({ name: 'last_sync_at', type: 'timestamptz', nullable: true })
  lastSyncAt!: Date | null;

  @Column({ name: 'last_sync_status', type: 'varchar', length: 32, nullable: true })
  lastSyncStatus!: string | null;

  @Column({ name: 'webhook_secret', type: 'varchar', length: 255, nullable: true })
  webhookSecret!: string | null;

  @Column({ name: 'connected_at', type: 'timestamptz', nullable: true })
  connectedAt!: Date | null;

  @OneToMany(() => IntegrationEventEntity, (event) => event.integration)
  events!: IntegrationEventEntity[];

  @OneToMany(() => IntegrationLogEntity, (log) => log.integration)
  logs!: IntegrationLogEntity[];
}
