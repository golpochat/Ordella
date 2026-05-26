import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTenantScopedEntity } from '../../loyalty/entities/base-tenant-scoped.entity';
import { SupportTicketEntity } from './support-ticket.entity';

@Entity('support_ticket_events')
@Index(['tenantId', 'ticketId', 'createdAt'])
export class SupportTicketEventEntity extends BaseTenantScopedEntity {
  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId!: string;

  @ManyToOne(() => SupportTicketEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: SupportTicketEntity;

  @Column({ type: 'varchar', length: 64 })
  type!: string;

  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId!: string | null;

  @Column({ name: 'actor_customer_id', type: 'uuid', nullable: true })
  actorCustomerId!: string | null;

  @Column({ name: 'from_value', type: 'varchar', length: 120, nullable: true })
  fromValue!: string | null;

  @Column({ name: 'to_value', type: 'varchar', length: 120, nullable: true })
  toValue!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;
}
