import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../../auth/entities/user.entity';
import { CustomerEntity } from '../../loyalty/entities';
import { BaseTenantScopedEntity } from '../../loyalty/entities/base-tenant-scoped.entity';
import { SupportMessageAuthorType } from './support-ticket.enums';
import { SupportTicketEntity } from './support-ticket.entity';

@Entity('support_ticket_messages')
@Index(['tenantId', 'ticketId', 'createdAt'])
export class SupportTicketMessageEntity extends BaseTenantScopedEntity {
  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId!: string;

  @ManyToOne(() => SupportTicketEntity, (ticket) => ticket.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: SupportTicketEntity;

  @Column({ name: 'author_type', type: 'varchar', length: 16 })
  authorType!: SupportMessageAuthorType;

  @Column({ name: 'author_user_id', type: 'uuid', nullable: true })
  authorUserId!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'author_user_id' })
  authorUser!: UserEntity | null;

  @Column({ name: 'author_customer_id', type: 'uuid', nullable: true })
  authorCustomerId!: string | null;

  @ManyToOne(() => CustomerEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'author_customer_id' })
  authorCustomer!: CustomerEntity | null;

  @Column({ type: 'text' })
  body!: string;

  @Column({ name: 'internal_only', type: 'boolean', default: false })
  internalOnly!: boolean;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  attachments!: Array<Record<string, unknown>>;
}
