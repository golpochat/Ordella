import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { UserEntity } from '../../auth/entities/user.entity';
import { DeliveryTaskEntity } from '../../deliveries/entities/delivery-task.entity';
import { CustomerEntity } from '../../loyalty/entities';
import { BaseTenantScopedEntity } from '../../loyalty/entities/base-tenant-scoped.entity';
import { OrderEntity } from '../../orders/entities/order.entity';
import { SubscriptionEntity } from '../../subscriptions/entities';
import {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketSource,
  SupportTicketStatus,
} from './support-ticket.enums';
import { SupportTicketMessageEntity } from './support-ticket-message.entity';

@Entity('support_tickets')
@Index(['tenantId', 'status', 'priority'])
@Index(['tenantId', 'customerId'])
@Index(['tenantId', 'assignedToId'])
@Index(['tenantId', 'category'])
export class SupportTicketEntity extends BaseTenantScopedEntity {
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer!: CustomerEntity;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId!: string | null;

  @ManyToOne(() => OrderEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order!: OrderEntity | null;

  @Column({ name: 'delivery_task_id', type: 'uuid', nullable: true })
  deliveryTaskId!: string | null;

  @ManyToOne(() => DeliveryTaskEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'delivery_task_id' })
  deliveryTask!: DeliveryTaskEntity | null;

  @Column({ name: 'subscription_id', type: 'uuid', nullable: true })
  subscriptionId!: string | null;

  @ManyToOne(() => SubscriptionEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'subscription_id' })
  subscription!: SubscriptionEntity | null;

  @Column({ type: 'varchar', length: 180 })
  subject!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 32 })
  category!: SupportTicketCategory;

  @Column({ type: 'varchar', length: 16, default: SupportTicketPriority.MEDIUM })
  priority!: SupportTicketPriority;

  @Column({ type: 'varchar', length: 32, default: SupportTicketStatus.OPEN })
  status!: SupportTicketStatus;

  @Column({ type: 'varchar', length: 32, default: SupportTicketSource.CUSTOMER_PORTAL })
  source!: SupportTicketSource;

  @Column({ name: 'assigned_to_id', type: 'uuid', nullable: true })
  assignedToId!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo!: UserEntity | null;

  @Column({ name: 'first_response_due_at', type: 'timestamptz', nullable: true })
  firstResponseDueAt!: Date | null;

  @Column({ name: 'first_responded_at', type: 'timestamptz', nullable: true })
  firstRespondedAt!: Date | null;

  @Column({ name: 'sla_due_at', type: 'timestamptz', nullable: true })
  slaDueAt!: Date | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt!: Date | null;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt!: Date | null;

  @Column({ name: 'escalated_at', type: 'timestamptz', nullable: true })
  escalatedAt!: Date | null;

  @Column({ name: 'csat_rating', type: 'int', nullable: true })
  csatRating!: number | null;

  @Column({ name: 'csat_comment', type: 'text', nullable: true })
  csatComment!: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  attachments!: Array<Record<string, unknown>>;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @OneToMany(() => SupportTicketMessageEntity, (message) => message.ticket)
  messages!: SupportTicketMessageEntity[];
}
