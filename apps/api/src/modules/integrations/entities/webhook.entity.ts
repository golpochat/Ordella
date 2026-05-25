import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
import { WebhookDeliveryLogEntity } from './webhook-delivery-log.entity';

@Entity('webhooks')
@Index(['tenantId', 'isActive'])
export class WebhookEntity extends BaseTenantScopedEntity {
  @Column({ type: 'varchar', length: 2048 })
  url!: string;

  @Column({ type: 'varchar', length: 255 })
  secret!: string;

  @Column({ type: 'jsonb', default: [] })
  events!: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'last_delivery_at', type: 'timestamptz', nullable: true })
  lastDeliveryAt!: Date | null;

  @OneToMany(() => WebhookDeliveryLogEntity, (log) => log.webhook)
  deliveryLogs!: WebhookDeliveryLogEntity[];
}
