import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { UserEntity } from '../../auth/entities/user.entity';
import {
  BulkSendNotificationDto,
  CreateNotificationDto,
  NotificationPreferenceResponseDto,
  NotificationResponseDto,
  UpdateNotificationPreferenceDto,
} from '../dto';
import {
  NotificationChannelEntity,
  NotificationEntity,
  NotificationLogEntity,
  NotificationPreferenceEntity,
  NotificationTemplateEntity,
} from '../entities';
import { NotificationChannelType } from '../enums/notification-channel-type.enum';
import { NotificationLogStatus } from '../enums/notification-log-status.enum';
import { NotificationStatus } from '../enums/notification-status.enum';
import { NotificationType } from '../enums/notification-type.enum';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(NotificationEntity)
    private readonly notifications: Repository<NotificationEntity>,
    @InjectRepository(NotificationLogEntity)
    private readonly logs: Repository<NotificationLogEntity>,
    @InjectRepository(NotificationPreferenceEntity)
    private readonly preferences: Repository<NotificationPreferenceEntity>,
    @InjectRepository(NotificationChannelEntity)
    private readonly channels: Repository<NotificationChannelEntity>,
    @InjectRepository(NotificationTemplateEntity)
    private readonly templates: Repository<NotificationTemplateEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async findAll(tenant: TenantContext, query: FilterPaginationDto): Promise<NotificationResponseDto[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const rows = await this.notifications.find({
      where: { tenantId: tenant.tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return rows.map((row) => this.toResponse(row));
  }

  async create(tenant: TenantContext, dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const notification = await this.createAndSend(tenant.tenantId, dto);
    return this.toResponse(notification);
  }

  async bulkSend(
    tenant: TenantContext,
    dto: BulkSendNotificationDto,
  ): Promise<NotificationResponseDto[]> {
    const sent = [];
    for (const notification of dto.notifications) {
      sent.push(await this.create(tenant, notification));
    }
    return sent;
  }

  async findOne(tenant: TenantContext, id: string): Promise<NotificationResponseDto> {
    const notification = await this.notifications.findOne({
      where: { id, tenantId: tenant.tenantId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return this.toResponse(notification);
  }

  async getPreferences(
    tenant: TenantContext,
    user: AuthenticatedUser | undefined,
    userId?: string,
  ): Promise<NotificationPreferenceResponseDto> {
    const resolvedUserId = userId ?? user?.id;
    if (!resolvedUserId) {
      throw new NotFoundException('User is required for notification preferences');
    }
    return this.toPreferenceResponse(
      await this.ensurePreference(tenant.tenantId, resolvedUserId),
    );
  }

  async updatePreferences(
    tenant: TenantContext,
    user: AuthenticatedUser | undefined,
    dto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreferenceResponseDto> {
    const resolvedUserId = dto.userId ?? user?.id;
    if (!resolvedUserId) {
      throw new NotFoundException('User is required for notification preferences');
    }
    const preference = await this.ensurePreference(tenant.tenantId, resolvedUserId);
    if (dto.emailEnabled !== undefined) preference.emailEnabled = dto.emailEnabled;
    if (dto.smsEnabled !== undefined) preference.smsEnabled = dto.smsEnabled;
    if (dto.pushEnabled !== undefined) preference.pushEnabled = dto.pushEnabled;
    if (dto.categories !== undefined) preference.categories = dto.categories;
    return this.toPreferenceResponse(await this.preferences.save(preference));
  }

  async sendSystemNotification(
    tenantId: string,
    dto: CreateNotificationDto,
  ): Promise<NotificationEntity> {
    return this.createAndSend(tenantId, dto);
  }

  async createAndSend(
    tenantId: string,
    dto: CreateNotificationDto,
  ): Promise<NotificationEntity> {
    const channel = dto.channel ?? NotificationChannelType.EMAIL;
    const user = dto.userId
      ? await this.users.findOne({ where: { id: dto.userId, tenantId } })
      : null;
    const recipient = dto.recipient ?? this.recipientForChannel(user, channel);
    const notification = await this.notifications.save(
      this.notifications.create({
        tenantId,
        type: dto.type,
        channel,
        userId: dto.userId ?? null,
        recipient,
        channelId: dto.channelId ?? null,
        templateId: dto.templateId ?? null,
        payload: dto.payload,
        status: NotificationStatus.PENDING,
        sentAt: null,
      }),
    );

    if (user && !(await this.isAllowedByPreferences(tenantId, user.id, dto.type, channel))) {
      notification.status = NotificationStatus.CANCELLED;
      return this.notifications.save(notification);
    }

    const rendered = await this.render(notification);
    const delivery = await this.deliver(channel, recipient, rendered);
    notification.status = delivery.ok ? NotificationStatus.SENT : NotificationStatus.FAILED;
    notification.sentAt = delivery.ok ? new Date() : null;
    const saved = await this.notifications.save(notification);
    await this.logs.save(
      this.logs.create({
        tenantId,
        notificationId: saved.id,
        channelId: saved.channelId,
        status: delivery.ok ? NotificationLogStatus.SENT : NotificationLogStatus.FAILED,
        providerResponse: delivery.response,
        errorMessage: delivery.error ?? null,
      }),
    );
    return saved;
  }

  private async ensurePreference(
    tenantId: string,
    userId: string,
  ): Promise<NotificationPreferenceEntity> {
    const existing = await this.preferences.findOne({ where: { tenantId, userId } });
    if (existing) {
      return existing;
    }
    return this.preferences.save(
      this.preferences.create({
        tenantId,
        userId,
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        categories: ['orders', 'inventory', 'staff', 'customer', 'billing'],
      }),
    );
  }

  private async isAllowedByPreferences(
    tenantId: string,
    userId: string,
    type: NotificationType,
    channel: NotificationChannelType,
  ): Promise<boolean> {
    const preference = await this.ensurePreference(tenantId, userId);
    if (channel === NotificationChannelType.EMAIL && !preference.emailEnabled) return false;
    if (channel === NotificationChannelType.SMS && !preference.smsEnabled) return false;
    if (channel === NotificationChannelType.PUSH && !preference.pushEnabled) return false;
    return preference.categories.includes(this.categoryForType(type));
  }

  private recipientForChannel(
    user: UserEntity | null,
    channel: NotificationChannelType,
  ): string | null {
    if (!user) return null;
    if (channel === NotificationChannelType.SMS) return user.phone;
    return user.email;
  }

  private async render(notification: NotificationEntity) {
    const templateName = String(notification.payload.templateName ?? notification.type);
    const template = notification.templateId
      ? await this.templates.findOne({
          where: { id: notification.templateId, tenantId: notification.tenantId },
        })
      : await this.templates.findOne({
          where: {
            tenantId: notification.tenantId,
            name: templateName,
            channel: notification.channel,
            isActive: true,
          },
        });

    const fallback = DEFAULT_TEMPLATES[notification.channel][templateName] ??
      DEFAULT_TEMPLATES[notification.channel][notification.type] ??
      DEFAULT_TEMPLATES[notification.channel].system;
    const subject = this.interpolate(template?.subject ?? fallback.subject, notification.payload);
    const text = this.interpolate(String(template?.content?.text ?? fallback.text), notification.payload);
    const html = this.interpolate(String(template?.content?.html ?? fallback.html ?? text), notification.payload);
    return { subject, text, html };
  }

  private async deliver(
    channel: NotificationChannelType,
    recipient: string | null,
    rendered: { subject: string; text: string; html: string },
  ): Promise<{ ok: boolean; response: Record<string, unknown>; error?: string }> {
    if (!recipient && channel !== NotificationChannelType.PUSH) {
      return { ok: false, response: {}, error: 'Missing recipient' };
    }

    try {
      if (channel === NotificationChannelType.EMAIL) {
        return this.deliverEmail(recipient!, rendered);
      }
      if (channel === NotificationChannelType.SMS) {
        return this.deliverSms(recipient!, rendered.text);
      }
      return { ok: true, response: { provider: 'push-placeholder', title: rendered.subject } };
    } catch (error) {
      return { ok: false, response: {}, error: (error as Error).message };
    }
  }

  private async deliverEmail(
    recipient: string,
    rendered: { subject: string; text: string; html: string },
  ): Promise<{ ok: boolean; response: Record<string, unknown>; error?: string }> {
    const from = this.config.get<string>('NOTIFICATIONS_EMAIL_FROM', 'Ordella <noreply@ordella.app>');
    const resendKey = this.config.get<string>('RESEND_API_KEY');
    if (resendKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to: recipient, subject: rendered.subject, html: rendered.html, text: rendered.text }),
      });
      return { ok: response.ok, response: { provider: 'resend', status: response.status } };
    }

    const sendGridKey = this.config.get<string>('SENDGRID_API_KEY');
    if (sendGridKey) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sendGridKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: recipient }] }],
          from: { email: from.includes('<') ? from.match(/<(.+)>/)?.[1] ?? from : from },
          subject: rendered.subject,
          content: [
            { type: 'text/plain', value: rendered.text },
            { type: 'text/html', value: rendered.html },
          ],
        }),
      });
      return { ok: response.ok, response: { provider: 'sendgrid', status: response.status } };
    }

    return { ok: true, response: { provider: 'email-placeholder', recipient } };
  }

  private async deliverSms(
    recipient: string,
    message: string,
  ): Promise<{ ok: boolean; response: Record<string, unknown>; error?: string }> {
    const accountSid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.config.get<string>('TWILIO_AUTH_TOKEN');
    const from = this.config.get<string>('TWILIO_FROM_NUMBER');
    if (accountSid && authToken && from) {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ From: from, To: recipient, Body: message }),
        },
      );
      return { ok: response.ok, response: { provider: 'twilio', status: response.status } };
    }

    return { ok: true, response: { provider: 'sms-placeholder', recipient } };
  }

  private interpolate(template: string, payload: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
      payload[key] !== undefined ? String(payload[key]) : '',
    );
  }

  private categoryForType(type: NotificationType): string {
    if (type === NotificationType.LOW_STOCK) return 'inventory';
    if (type === NotificationType.STAFF) return 'staff';
    if (type === NotificationType.SUBSCRIPTION || type === NotificationType.PAYMENT_ALERT) return 'billing';
    if (type === NotificationType.CUSTOMER) return 'customer';
    return 'orders';
  }

  private toResponse(notification: NotificationEntity): NotificationResponseDto {
    return {
      id: notification.id,
      tenantId: notification.tenantId,
      type: notification.type,
      channel: notification.channel,
      userId: notification.userId,
      recipient: notification.recipient,
      channelId: notification.channelId,
      templateId: notification.templateId,
      payload: notification.payload,
      status: notification.status,
      scheduledAt: notification.scheduledAt,
      sentAt: notification.sentAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }

  private toPreferenceResponse(
    preference: NotificationPreferenceEntity,
  ): NotificationPreferenceResponseDto {
    return {
      id: preference.id,
      tenantId: preference.tenantId,
      userId: preference.userId,
      emailEnabled: preference.emailEnabled,
      smsEnabled: preference.smsEnabled,
      pushEnabled: preference.pushEnabled,
      categories: preference.categories,
      createdAt: preference.createdAt,
      updatedAt: preference.updatedAt,
    };
  }
}

const DEFAULT_TEMPLATES: Record<
  NotificationChannelType,
  Record<string, { subject: string; text: string; html?: string }>
> = {
  [NotificationChannelType.EMAIL]: {
    order_placed: {
      subject: 'Order #{{orderNumber}} received',
      text: 'Thanks. Your order #{{orderNumber}} has been received.',
    },
    order_ready: {
      subject: 'Your order is ready',
      text: 'Your order #{{orderNumber}} is ready for pickup.',
    },
    order_delivered: {
      subject: 'Your order was delivered',
      text: 'Your order #{{orderNumber}} has been delivered.',
    },
    low_stock: {
      subject: 'Low stock alert: {{itemName}}',
      text: '{{itemName}} is at {{stockLevel}} units. Reorder point is {{reorderPoint}}.',
    },
    staff_invite: {
      subject: 'You have been invited to Ordella',
      text: 'You have been invited to join {{businessName}} on Ordella.',
    },
    subscription_failed: {
      subject: 'Subscription payment failed',
      text: 'Your subscription payment failed. Please update your billing details.',
    },
    marketing: { subject: '{{subject}}', text: '{{message}}', html: '<p>{{message}}</p>' },
    system: { subject: 'Business update', text: '{{message}}' },
  },
  [NotificationChannelType.SMS]: {
    order_ready: {
      subject: 'Order ready',
      text: 'Your order #{{orderNumber}} is ready for pickup.',
    },
    order_out_for_delivery: {
      subject: 'Delivery update',
      text: 'Your delivery is on the way.',
    },
    system: { subject: 'Business update', text: '{{message}}' },
    marketing: { subject: 'Promotion', text: '{{message}}' },
  },
  [NotificationChannelType.PUSH]: {
    new_order: { subject: 'New order received', text: 'New order received' },
    low_stock: { subject: 'Low stock alert', text: 'Low stock alert' },
    system: { subject: 'Business update', text: '{{message}}' },
  },
  [NotificationChannelType.WHATSAPP]: {
    system: { subject: 'Business update', text: '{{message}}' },
  },
  [NotificationChannelType.IN_APP]: {
    system: { subject: 'Business update', text: '{{message}}' },
  },
};
