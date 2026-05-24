import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IntegrationEventStatus } from '../enums/integration-event-status.enum';
import { IntegrationEntity } from './integration.entity';

/** Inbound / outbound partner webhook and sync events */
@Entity('integration_events')
@Index(['integrationId', 'createdAt'])
@Index(['eventType', 'status'])
export class IntegrationEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'integration_id', type: 'uuid' })
  integrationId!: string;

  @ManyToOne(() => IntegrationEntity, (integration) => integration.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'integration_id' })
  integration!: IntegrationEntity;

  @Column({ name: 'event_type', type: 'varchar', length: 128 })
  eventType!: string;

  @Column({ name: 'external_id', type: 'varchar', length: 255, nullable: true })
  externalId!: string | null;

  @Column({ type: 'jsonb', default: {} })
  payload!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 32, default: IntegrationEventStatus.RECEIVED })
  status!: IntegrationEventStatus;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt!: Date | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
