import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WebhookEntity } from './webhook.entity';

@Entity('webhook_delivery_logs')
@Index(['tenantId', 'createdAt'])
@Index(['webhookId', 'createdAt'])
export class WebhookDeliveryLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'webhook_id', type: 'uuid' })
  webhookId!: string;

  @ManyToOne(() => WebhookEntity, (webhook) => webhook.deliveryLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'webhook_id' })
  webhook!: WebhookEntity;

  @Column({ name: 'event_type', type: 'varchar', length: 128 })
  eventType!: string;

  @Column({ type: 'int', default: 1 })
  attempt!: number;

  @Column({ name: 'status_code', type: 'int', nullable: true })
  statusCode!: number | null;

  @Column({ name: 'response_body', type: 'text', nullable: true })
  responseBody!: string | null;

  @Column({ type: 'boolean', default: false })
  success!: boolean;

  @Column({ type: 'jsonb', default: {} })
  payload!: Record<string, unknown>;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
