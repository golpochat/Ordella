import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IntegrationLogLevel } from '../enums/integration-log-level.enum';
import { IntegrationEntity } from './integration.entity';

/** SRS §59 — integration audit / sync logs */
@Entity('integration_logs')
@Index(['integrationId', 'createdAt'])
@Index(['tenantId', 'level'])
export class IntegrationLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'integration_id', type: 'uuid' })
  integrationId!: string;

  @ManyToOne(() => IntegrationEntity, (integration) => integration.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'integration_id' })
  integration!: IntegrationEntity;

  @Column({ type: 'varchar', length: 16 })
  level!: IntegrationLogLevel;

  @Column({ type: 'varchar', length: 64 })
  action!: string;

  @Column({ type: 'text', nullable: true })
  message!: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @Column({ name: 'request_payload', type: 'jsonb', nullable: true })
  requestPayload!: Record<string, unknown> | null;

  @Column({ name: 'response_payload', type: 'jsonb', nullable: true })
  responsePayload!: Record<string, unknown> | null;

  @Column({ name: 'error_code', type: 'varchar', length: 64, nullable: true })
  errorCode!: string | null;

  @Column({ name: 'duration_ms', type: 'int', nullable: true })
  durationMs!: number | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
