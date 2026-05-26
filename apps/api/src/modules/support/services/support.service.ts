import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { UserEntity } from '../../auth/entities/user.entity';
import { DeliveryEventEntity } from '../../deliveries/entities/delivery-event.entity';
import { DeliveryTaskEntity } from '../../deliveries/entities/delivery-task.entity';
import { CustomerEntity } from '../../loyalty/entities';
import { NotificationChannelType } from '../../notifications/enums/notification-channel-type.enum';
import { NotificationType } from '../../notifications/enums/notification-type.enum';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { OrderEntity } from '../../orders/entities/order.entity';
import { SubscriptionEntity } from '../../subscriptions/entities';
import {
  AddSupportMessageDto,
  CreateSupportChatTicketDto,
  AssignSupportTicketDto,
  CreateSupportTicketDto,
  RateSupportTicketDto,
  UpdateSupportTicketDto,
} from '../dto';
import {
  SupportMessageAuthorType,
  SupportTicketCategory,
  SupportTicketEntity,
  SupportTicketEventEntity,
  SupportTicketMessageEntity,
  SupportTicketPriority,
  SupportTicketSource,
  SupportTicketStatus,
} from '../entities';

type TicketFilters = {
  status?: SupportTicketStatus;
  category?: SupportTicketCategory;
  priority?: SupportTicketPriority;
  assignedTo?: string;
  customerId?: string;
};

const SLA_RULES: Record<SupportTicketCategory, { firstResponseHours: number; resolutionHours: number; escalationHours: number }> = {
  [SupportTicketCategory.ORDER_ISSUE]: { firstResponseHours: 4, resolutionHours: 24, escalationHours: 12 },
  [SupportTicketCategory.DELIVERY_ISSUE]: { firstResponseHours: 1, resolutionHours: 8, escalationHours: 4 },
  [SupportTicketCategory.REFUND]: { firstResponseHours: 8, resolutionHours: 72, escalationHours: 24 },
  [SupportTicketCategory.PRODUCT_ISSUE]: { firstResponseHours: 6, resolutionHours: 48, escalationHours: 24 },
  [SupportTicketCategory.SUBSCRIPTION]: { firstResponseHours: 4, resolutionHours: 24, escalationHours: 12 },
  [SupportTicketCategory.LOYALTY]: { firstResponseHours: 8, resolutionHours: 48, escalationHours: 24 },
  [SupportTicketCategory.GENERAL]: { firstResponseHours: 12, resolutionHours: 72, escalationHours: 36 },
};

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicketEntity)
    private readonly tickets: Repository<SupportTicketEntity>,
    @InjectRepository(SupportTicketMessageEntity)
    private readonly messages: Repository<SupportTicketMessageEntity>,
    @InjectRepository(SupportTicketEventEntity)
    private readonly events: Repository<SupportTicketEventEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    @InjectRepository(DeliveryTaskEntity)
    private readonly deliveries: Repository<DeliveryTaskEntity>,
    @InjectRepository(DeliveryEventEntity)
    private readonly deliveryEvents: Repository<DeliveryEventEntity>,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptions: Repository<SubscriptionEntity>,
    private readonly notifications: NotificationsService,
  ) {}

  async list(tenant: TenantContext, filters: TicketFilters = {}) {
    const tickets = await this.tickets.find({
      where: {
        tenantId: tenant.tenantId,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.priority ? { priority: filters.priority } : {}),
        ...(filters.assignedTo ? { assignedToId: filters.assignedTo } : {}),
        ...(filters.customerId ? { customerId: filters.customerId } : {}),
      },
      relations: { customer: true, assignedTo: true, messages: true },
      order: { updatedAt: 'DESC' },
      take: 200,
    });
    return tickets.map((ticket) => this.withSlaState(ticket));
  }

  async listForCustomer(tenant: TenantContext, customerId: string) {
    return this.list(tenant, { customerId });
  }

  async get(tenant: TenantContext, id: string, customerId?: string) {
    const ticket = await this.tickets.findOne({
      where: { tenantId: tenant.tenantId, id, ...(customerId ? { customerId } : {}) },
      relations: {
        customer: true,
        assignedTo: true,
        order: true,
        deliveryTask: true,
        subscription: true,
        messages: true,
      },
      order: { messages: { createdAt: 'ASC' } },
    });
    if (!ticket) throw new NotFoundException('Support ticket not found');
    const deliveryEvents = ticket.deliveryTaskId
      ? await this.deliveryEvents.find({
          where: { tenantId: tenant.tenantId, deliveryTaskId: ticket.deliveryTaskId },
          order: { createdAt: 'DESC' },
          take: 10,
        })
      : [];
    return this.withSlaState({ ...ticket, deliveryEvents });
  }

  async create(
    tenant: TenantContext,
    dto: CreateSupportTicketDto,
    options: { customerId?: string; actorUserId?: string; source: SupportTicketSource },
  ) {
    const customerId = options.customerId ?? dto.customerId;
    if (!customerId) throw new BadRequestException('Customer is required');
    const customer = await this.requireCustomer(tenant.tenantId, customerId);
    await this.validateLinks(tenant.tenantId, customer.id, dto);
    const deliveryTask = dto.orderId
      ? await this.deliveries.findOne({ where: { tenantId: tenant.tenantId, orderId: dto.orderId } })
      : null;
    const now = new Date();
    const sla = SLA_RULES[dto.category];
    const ticket = await this.tickets.save(this.tickets.create({
      tenantId: tenant.tenantId,
      customerId: customer.id,
      orderId: dto.orderId ?? null,
      deliveryTaskId: deliveryTask?.id ?? null,
      subscriptionId: dto.subscriptionId ?? null,
      subject: dto.subject.trim(),
      description: dto.message.trim(),
      category: dto.category,
      priority: dto.priority ?? SupportTicketPriority.MEDIUM,
      status: SupportTicketStatus.OPEN,
      source: options.source,
      firstResponseDueAt: this.addHours(now, sla.firstResponseHours),
      slaDueAt: this.addHours(now, sla.resolutionHours),
      attachments: this.normalizeAttachments(dto.attachments),
      metadata: {
        ...(dto.metadata ?? {}),
        sla,
        escalationDueAt: this.addHours(now, sla.escalationHours).toISOString(),
      },
    }));
    await this.messages.save(this.messages.create({
      tenantId: tenant.tenantId,
      ticketId: ticket.id,
      authorType: options.actorUserId ? SupportMessageAuthorType.STAFF : SupportMessageAuthorType.CUSTOMER,
      authorUserId: options.actorUserId ?? null,
      authorCustomerId: options.actorUserId ? null : customer.id,
      body: dto.message.trim(),
      internalOnly: false,
      attachments: this.normalizeAttachments(dto.attachments),
    }));
    await this.recordEvent(ticket, 'created', null, ticket.status, options);
    await this.notifyStaff(tenant.tenantId, ticket);
    return this.get(tenant, ticket.id, options.customerId);
  }

  async createFromChat(tenant: TenantContext, dto: CreateSupportChatTicketDto) {
    if (!dto.email && !dto.phone) throw new BadRequestException('Email or phone is required');
    const customer = await this.findOrCreateCustomer(tenant.tenantId, dto);
    return this.create(
      tenant,
      { ...dto, customerId: customer.id },
      { customerId: customer.id, source: SupportTicketSource.STOREFRONT_CHAT },
    );
  }

  async update(tenant: TenantContext, id: string, dto: UpdateSupportTicketDto, user: AuthenticatedUser) {
    const ticket = await this.requireTicket(tenant.tenantId, id);
    if (dto.orderId !== undefined || dto.subscriptionId !== undefined) {
      await this.validateLinks(tenant.tenantId, ticket.customerId, {
        orderId: dto.orderId ?? undefined,
        subscriptionId: dto.subscriptionId ?? undefined,
      });
    }
    const previousStatus = ticket.status;
    const previousPriority = ticket.priority;
    const previousAssignee = ticket.assignedToId;
    if (dto.status !== undefined) {
      ticket.status = dto.status;
      if (dto.status === SupportTicketStatus.RESOLVED) ticket.resolvedAt = ticket.resolvedAt ?? new Date();
      if (dto.status === SupportTicketStatus.CLOSED) ticket.closedAt = ticket.closedAt ?? new Date();
    }
    if (dto.priority !== undefined) ticket.priority = dto.priority;
    if (dto.assignedTo !== undefined) ticket.assignedToId = await this.requireStaff(tenant.tenantId, dto.assignedTo);
    if (dto.orderId !== undefined) {
      ticket.orderId = dto.orderId;
      const deliveryTask = await this.deliveries.findOne({ where: { tenantId: tenant.tenantId, orderId: dto.orderId } });
      ticket.deliveryTaskId = deliveryTask?.id ?? ticket.deliveryTaskId;
    }
    if (dto.subscriptionId !== undefined) ticket.subscriptionId = dto.subscriptionId;
    if (dto.metadata !== undefined) ticket.metadata = { ...(ticket.metadata ?? {}), ...dto.metadata };
    const saved = await this.tickets.save(ticket);
    if (previousStatus !== saved.status) {
      await this.recordEvent(saved, 'status_changed', previousStatus, saved.status, { actorUserId: user.id });
      await this.notifyCustomer(saved, 'Support ticket updated', `Your ticket "${saved.subject}" is now ${saved.status}.`);
    }
    if (previousPriority !== saved.priority) {
      await this.recordEvent(saved, 'priority_changed', previousPriority, saved.priority, { actorUserId: user.id });
    }
    if (previousAssignee !== saved.assignedToId) {
      await this.recordEvent(saved, 'assigned', previousAssignee, saved.assignedToId, { actorUserId: user.id });
      await this.notifyAssignee(tenant.tenantId, saved);
    }
    return this.get(tenant, id);
  }

  async assign(tenant: TenantContext, id: string, dto: AssignSupportTicketDto, user: AuthenticatedUser) {
    return this.update(tenant, id, { assignedTo: dto.assignedTo, status: SupportTicketStatus.IN_PROGRESS }, user);
  }

  async addMessage(
    tenant: TenantContext,
    id: string,
    dto: AddSupportMessageDto,
    actor: { customerId?: string; user?: AuthenticatedUser },
  ) {
    const ticket = await this.requireTicket(tenant.tenantId, id, actor.customerId);
    const isStaff = Boolean(actor.user);
    const internalOnly = isStaff && Boolean(dto.internalOnly);
    const message = await this.messages.save(this.messages.create({
      tenantId: tenant.tenantId,
      ticketId: ticket.id,
      authorType: isStaff ? SupportMessageAuthorType.STAFF : SupportMessageAuthorType.CUSTOMER,
      authorUserId: actor.user?.id ?? null,
      authorCustomerId: actor.customerId ?? null,
      body: dto.body.trim(),
      internalOnly,
      attachments: this.normalizeAttachments(dto.attachments),
    }));
    if (isStaff && !internalOnly) {
      ticket.firstRespondedAt = ticket.firstRespondedAt ?? new Date();
      ticket.status = SupportTicketStatus.WAITING_CUSTOMER;
      await this.tickets.save(ticket);
      await this.notifyCustomer(ticket, 'Support replied', `We replied to "${ticket.subject}".`);
    }
    if (!isStaff && ticket.status === SupportTicketStatus.WAITING_CUSTOMER) {
      ticket.status = SupportTicketStatus.OPEN;
      await this.tickets.save(ticket);
      await this.notifyAssignee(tenant.tenantId, ticket);
    }
    await this.recordEvent(ticket, internalOnly ? 'internal_note_added' : 'message_added', null, null, {
      actorUserId: actor.user?.id,
      actorCustomerId: actor.customerId,
      metadata: { messageId: message.id },
    });
    return this.get(tenant, id, actor.customerId);
  }

  async rate(tenant: TenantContext, id: string, customerId: string, dto: RateSupportTicketDto) {
    const ticket = await this.requireTicket(tenant.tenantId, id, customerId);
    if (![SupportTicketStatus.RESOLVED, SupportTicketStatus.CLOSED].includes(ticket.status)) {
      throw new BadRequestException('Only resolved tickets can be rated');
    }
    ticket.csatRating = dto.rating;
    ticket.csatComment = dto.comment ?? null;
    await this.tickets.save(ticket);
    await this.recordEvent(ticket, 'csat_added', null, dto.rating.toString(), { actorCustomerId: customerId });
    return this.get(tenant, id, customerId);
  }

  async analytics(tenant: TenantContext) {
    const tickets = await this.tickets.find({ where: { tenantId: tenant.tenantId }, relations: { assignedTo: true } });
    const resolved = tickets.filter((ticket) => ticket.resolvedAt);
    const averageResolutionHours = resolved.length
      ? resolved.reduce((sum, ticket) => sum + (ticket.resolvedAt!.getTime() - ticket.createdAt.getTime()) / 36e5, 0) / resolved.length
      : 0;
    const ticketsWithSla = tickets.filter((ticket) => ticket.slaDueAt && (ticket.resolvedAt || ticket.closedAt));
    const slaMet = ticketsWithSla.filter((ticket) => (ticket.resolvedAt ?? ticket.closedAt)! <= ticket.slaDueAt!).length;
    const volumeByCategory = Object.values(SupportTicketCategory).map((category) => ({
      category,
      count: tickets.filter((ticket) => ticket.category === category).length,
    }));
    const staffIds = [...new Set(tickets.map((ticket) => ticket.assignedToId).filter(Boolean))] as string[];
    const staffPerformance = staffIds.map((staffId) => {
      const rows = tickets.filter((ticket) => ticket.assignedToId === staffId);
      const staffResolved = rows.filter((ticket) => ticket.resolvedAt);
      return {
        staffId,
        staffName: rows[0]?.assignedTo?.name ?? 'Staff member',
        assigned: rows.length,
        resolved: staffResolved.length,
        averageResolutionHours: Number((staffResolved.length
          ? staffResolved.reduce((sum, ticket) => sum + (ticket.resolvedAt!.getTime() - ticket.createdAt.getTime()) / 36e5, 0) / staffResolved.length
          : 0).toFixed(2)),
      };
    });
    const csatRows = tickets.filter((ticket) => ticket.csatRating);
    return {
      totalTickets: tickets.length,
      openTickets: tickets.filter((ticket) => ticket.status === SupportTicketStatus.OPEN).length,
      averageResolutionHours: Number(averageResolutionHours.toFixed(2)),
      slaCompliance: ticketsWithSla.length ? Number(((slaMet / ticketsWithSla.length) * 100).toFixed(2)) : 100,
      volumeByCategory,
      staffPerformance,
      csatAverage: csatRows.length
        ? Number((csatRows.reduce((sum, ticket) => sum + Number(ticket.csatRating), 0) / csatRows.length).toFixed(2))
        : null,
    };
  }

  cannedResponses() {
    return [
      { id: 'order-delay', title: 'Order delay', body: 'Thanks for reaching out. We are checking your order status and will update you shortly.' },
      { id: 'refund-review', title: 'Refund review', body: 'We have opened a refund review and will confirm the outcome after checking the payment and order history.' },
      { id: 'delivery-issue', title: 'Delivery issue', body: 'We are reviewing the delivery events and driver notes attached to your order.' },
      { id: 'subscription-billing', title: 'Subscription billing', body: 'We are checking your membership billing details and renewal history.' },
    ];
  }

  private async validateLinks(tenantId: string, customerId: string, dto: { orderId?: string; subscriptionId?: string }) {
    if (dto.orderId) {
      const order = await this.orders.findOne({ where: { tenantId, id: dto.orderId, customerId } });
      if (!order) throw new BadRequestException('Order does not belong to this customer');
    }
    if (dto.subscriptionId) {
      const subscription = await this.subscriptions.findOne({ where: { tenantId, id: dto.subscriptionId, customerId } });
      if (!subscription) throw new BadRequestException('Subscription does not belong to this customer');
    }
  }

  private async requireTicket(tenantId: string, id: string, customerId?: string) {
    const ticket = await this.tickets.findOne({
      where: { tenantId, id, ...(customerId ? { customerId } : {}) },
      relations: { customer: true, assignedTo: true, messages: true },
    });
    if (!ticket) throw new NotFoundException('Support ticket not found');
    return ticket;
  }

  private async requireCustomer(tenantId: string, customerId: string) {
    const customer = await this.customers.findOne({ where: { tenantId, id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  private async findOrCreateCustomer(tenantId: string, dto: CreateSupportChatTicketDto) {
    const email = dto.email?.trim().toLowerCase() || null;
    const phone = dto.phone?.trim() || null;
    const existing = email
      ? await this.customers.findOne({ where: { tenantId, email } })
      : phone
        ? await this.customers.findOne({ where: { tenantId, phone } })
        : null;
    if (existing) return existing;
    return this.customers.save(this.customers.create({
      tenantId,
      name: dto.name.trim(),
      email,
      phone,
    }));
  }

  private async requireStaff(tenantId: string, userId: string) {
    const user = await this.users.findOne({ where: { tenantId, id: userId } });
    if (!user) throw new NotFoundException('Staff user not found');
    return user.id;
  }

  private async recordEvent(
    ticket: SupportTicketEntity,
    type: string,
    fromValue: string | null,
    toValue: string | null,
    actor: { actorUserId?: string; actorCustomerId?: string; metadata?: Record<string, unknown> },
  ) {
    await this.events.save(this.events.create({
      tenantId: ticket.tenantId,
      ticketId: ticket.id,
      type,
      fromValue,
      toValue,
      actorUserId: actor.actorUserId ?? null,
      actorCustomerId: actor.actorCustomerId ?? null,
      metadata: actor.metadata ?? {},
    }));
  }

  private withSlaState<T extends SupportTicketEntity | (SupportTicketEntity & { deliveryEvents?: DeliveryEventEntity[] })>(ticket: T) {
    const now = new Date();
    return {
      ...ticket,
      sla: {
        firstResponseDueAt: ticket.firstResponseDueAt,
        slaDueAt: ticket.slaDueAt,
        breached: Boolean(ticket.slaDueAt && now > ticket.slaDueAt && !ticket.resolvedAt && !ticket.closedAt),
        firstResponseBreached: Boolean(ticket.firstResponseDueAt && now > ticket.firstResponseDueAt && !ticket.firstRespondedAt),
        escalated: Boolean(ticket.escalatedAt),
      },
    };
  }

  private addHours(from: Date, hours: number) {
    return new Date(from.getTime() + hours * 60 * 60 * 1000);
  }

  private normalizeAttachments(attachments?: Array<{ name: string; contentType?: string; url?: string; size?: number }>): Array<Record<string, unknown>> {
    return (attachments ?? []).map((attachment) => ({
      name: attachment.name,
      contentType: attachment.contentType ?? null,
      url: attachment.url ?? null,
      size: attachment.size ?? null,
    }));
  }

  private async notifyCustomer(ticket: SupportTicketEntity, subject: string, message: string) {
    const customer = ticket.customer ?? await this.customers.findOne({ where: { tenantId: ticket.tenantId, id: ticket.customerId } });
    const recipient = customer?.email ?? customer?.phone;
    if (!customer || !recipient) return;
    await this.notifications.createAndSend(ticket.tenantId, {
      type: NotificationType.SUPPORT,
      channel: customer.email ? NotificationChannelType.EMAIL : NotificationChannelType.SMS,
      recipient,
      payload: { templateName: 'system', subject, message },
    });
  }

  private async notifyStaff(tenantId: string, ticket: SupportTicketEntity) {
    const users = await this.users.find({ where: { tenantId }, take: 5 });
    for (const user of users) {
      await this.notifications.createAndSend(tenantId, {
        type: NotificationType.SUPPORT,
        channel: NotificationChannelType.EMAIL,
        recipient: user.email,
        payload: { templateName: 'system', subject: 'New support ticket', message: ticket.subject },
      });
    }
  }

  private async notifyAssignee(tenantId: string, ticket: SupportTicketEntity) {
    if (!ticket.assignedToId) return;
    const user = await this.users.findOne({ where: { tenantId, id: ticket.assignedToId } });
    if (!user) return;
    await this.notifications.createAndSend(tenantId, {
      type: NotificationType.SUPPORT,
      channel: NotificationChannelType.EMAIL,
      recipient: user.email,
      payload: { templateName: 'system', subject: 'Support ticket assigned', message: ticket.subject },
    });
  }
}
