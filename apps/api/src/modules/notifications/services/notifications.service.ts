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
  UpdateTenantNotificationSettingsDto,
  UpdateNotificationPreferenceDto,
} from '../dto';
import { TenantSettingsEntity } from '../../onboarding/entities/tenant-settings.entity';
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
    @InjectRepository(TenantSettingsEntity)
    private readonly tenantSettings: Repository<TenantSettingsEntity>,
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

  async getTenantNotificationSettings(tenant: TenantContext) {
    const settings = await this.ensureTenantSettings(tenant.tenantId);
    return this.toTenantNotificationSettings(settings);
  }

  async updateTenantNotificationSettings(
    tenant: TenantContext,
    dto: UpdateTenantNotificationSettingsDto,
  ) {
    const settings = await this.ensureTenantSettings(tenant.tenantId);
    if (dto.emailEnabled !== undefined) settings.notificationEmailEnabled = dto.emailEnabled;
    if (dto.smsEnabled !== undefined) settings.notificationSmsEnabled = dto.smsEnabled;
    if (dto.pushEnabled !== undefined) settings.notificationPushEnabled = dto.pushEnabled;
    if (dto.fromName !== undefined) settings.notificationFromName = dto.fromName.trim() || 'Ordella';
    if (dto.fromEmail !== undefined) settings.notificationFromEmail = dto.fromEmail.trim();
    return this.toTenantNotificationSettings(await this.tenantSettings.save(settings));
  }

  async renderAdHocTemplate(
    tenantId: string,
    channel: NotificationChannelType,
    template: { name: string; subject: string | null; content: Record<string, unknown> },
    variables: Record<string, unknown>,
  ) {
    const enriched = await this.enrichPayload(tenantId, variables);
    const subject = this.interpolate(template.subject ?? String(template.content.subject ?? '{{subject}}'), enriched);
    const text = this.interpolate(String(template.content.text ?? ''), enriched);
    const html = this.interpolate(String(template.content.html ?? text), enriched);
    return { channel, templateName: template.name, subject, text, html, variables: enriched };
  }

  async sendRenderedNotification(
    tenantId: string,
    channel: NotificationChannelType,
    recipient: string,
    rendered: { subject: string; text: string; html: string },
    payload: Record<string, unknown>,
  ) {
    const notification = await this.notifications.save(this.notifications.create({
      tenantId,
      type: NotificationType.SYSTEM,
      channel,
      userId: null,
      recipient,
      channelId: null,
      templateId: null,
      payload,
      status: NotificationStatus.PENDING,
      sentAt: null,
    }));
    const delivery = await this.deliver(tenantId, channel, recipient, rendered);
    notification.status = delivery.ok ? NotificationStatus.SENT : NotificationStatus.FAILED;
    notification.sentAt = delivery.ok ? new Date() : null;
    const saved = await this.notifications.save(notification);
    await this.logs.save(this.logs.create({
      tenantId,
      notificationId: saved.id,
      channelId: null,
      status: delivery.ok ? NotificationLogStatus.SENT : NotificationLogStatus.FAILED,
      providerResponse: delivery.response,
      errorMessage: delivery.error ?? null,
    }));
    return saved;
  }

  async dispatchEvent(
    tenantId: string,
    eventName: string,
    payload: Record<string, unknown>,
    options: { recipient?: string | null; channel?: NotificationChannelType; type?: NotificationType } = {},
  ) {
    const channel = options.channel ?? NotificationChannelType.EMAIL;
    const templateName = String(payload.templateName ?? this.interpolate(EVENT_TEMPLATE_MAP[eventName] ?? eventName.replace(/\./g, '_'), payload));
    return this.createAndSend(tenantId, {
      type: options.type ?? this.typeForEvent(eventName),
      channel,
      recipient: options.recipient ?? undefined,
      payload: { ...payload, eventName, templateName },
    });
  }

  async createAndSend(
    tenantId: string,
    dto: CreateNotificationDto,
  ): Promise<NotificationEntity> {
    const channel = dto.channel ?? NotificationChannelType.EMAIL;
    const tenantSettings = await this.ensureTenantSettings(tenantId);
    if (!this.isTenantChannelEnabled(tenantSettings, channel)) {
      const notification = await this.notifications.save(
        this.notifications.create({
          tenantId,
          type: dto.type,
          channel,
          userId: dto.userId ?? null,
          recipient: dto.recipient ?? null,
          channelId: dto.channelId ?? null,
          templateId: dto.templateId ?? null,
          payload: dto.payload,
          status: NotificationStatus.CANCELLED,
          sentAt: null,
        }),
      );
      await this.logs.save(this.logs.create({
        tenantId,
        notificationId: notification.id,
        channelId: notification.channelId,
        status: NotificationLogStatus.FAILED,
        providerResponse: { reason: 'tenant_channel_disabled', channel },
        errorMessage: `${channel} notifications are disabled for this tenant`,
      }));
      return notification;
    }
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
    const delivery = await this.deliver(tenantId, channel, recipient, rendered);
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
    const payload = await this.enrichPayload(notification.tenantId, notification.payload);
    const subject = this.interpolate(template?.subject ?? fallback.subject, payload);
    const text = this.interpolate(String(template?.content?.text ?? fallback.text), payload);
    const html = this.interpolate(String(template?.content?.html ?? fallback.html ?? text), payload);
    return { subject, text, html };
  }

  private async deliver(
    tenantId: string,
    channel: NotificationChannelType,
    recipient: string | null,
    rendered: { subject: string; text: string; html: string },
  ): Promise<{ ok: boolean; response: Record<string, unknown>; error?: string }> {
    if (!recipient && channel !== NotificationChannelType.PUSH) {
      return { ok: false, response: {}, error: 'Missing recipient' };
    }

    try {
      if (channel === NotificationChannelType.EMAIL) {
        return this.deliverEmail(tenantId, recipient!, rendered);
      }
      if (channel === NotificationChannelType.SMS) {
        return this.deliverSms(recipient!, rendered.text);
      }
      return this.deliverPush(recipient, rendered);
    } catch (error) {
      return { ok: false, response: {}, error: (error as Error).message };
    }
  }

  private async deliverEmail(
    tenantId: string,
    recipient: string,
    rendered: { subject: string; text: string; html: string },
  ): Promise<{ ok: boolean; response: Record<string, unknown>; error?: string }> {
    const settings = await this.ensureTenantSettings(tenantId);
    const from = `${settings.notificationFromName} <${settings.notificationFromEmail}>`;
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

  private async deliverPush(
    recipient: string | null,
    rendered: { subject: string; text: string; html: string },
  ): Promise<{ ok: boolean; response: Record<string, unknown>; error?: string }> {
    const serverKey = this.config.get<string>('FCM_SERVER_KEY');
    if (serverKey && recipient) {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          Authorization: `key=${serverKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipient,
          notification: { title: rendered.subject, body: rendered.text },
          data: { html: rendered.html },
        }),
      });
      return { ok: response.ok, response: { provider: 'fcm', status: response.status } };
    }
    return { ok: true, response: { provider: 'push-placeholder', title: rendered.subject } };
  }

  private interpolate(template: string, payload: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
      payload[key] !== undefined ? String(payload[key]) : '',
    );
  }

  private categoryForType(type: NotificationType): string {
    if (type === NotificationType.LOW_STOCK) return 'inventory';
    if (type === NotificationType.FORECAST_ALERT || type === NotificationType.REPLENISHMENT) return 'inventory';
    if (type === NotificationType.STAFF) return 'staff';
    if (type === NotificationType.SUBSCRIPTION || type === NotificationType.PAYMENT_ALERT) return 'billing';
    if (type === NotificationType.CUSTOMER) return 'customer';
    return 'orders';
  }

  private async ensureTenantSettings(tenantId: string) {
    const existing = await this.tenantSettings.findOne({ where: { tenantId } });
    if (existing) return existing;
    return this.tenantSettings.save(this.tenantSettings.create({
      tenantId,
      currency: 'EUR',
      currencySymbol: '€',
      locale: 'en-IE',
      timezone: 'Europe/Dublin',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: '1,234.56',
      country: 'IE',
      defaultTaxRate: '0',
      deliveryEnabled: true,
      deliveryFee: '0.00',
      minimumOrderAmount: '0.00',
      freeDeliveryThreshold: null,
      deliveryRadiusKm: '5.00',
      deliveryZones: [],
      notificationEmailEnabled: true,
      notificationSmsEnabled: false,
      notificationPushEnabled: true,
      notificationFromName: 'Ordella',
      notificationFromEmail: 'noreply@ordella.app',
      openingHours: {},
      metadata: {},
    }));
  }

  private toTenantNotificationSettings(settings: TenantSettingsEntity) {
    return {
      emailEnabled: settings.notificationEmailEnabled,
      smsEnabled: settings.notificationSmsEnabled,
      pushEnabled: settings.notificationPushEnabled,
      fromName: settings.notificationFromName,
      fromEmail: settings.notificationFromEmail,
    };
  }

  private isTenantChannelEnabled(settings: TenantSettingsEntity, channel: NotificationChannelType) {
    if (channel === NotificationChannelType.EMAIL) return settings.notificationEmailEnabled;
    if (channel === NotificationChannelType.SMS) return settings.notificationSmsEnabled;
    if (channel === NotificationChannelType.PUSH) return settings.notificationPushEnabled;
    return true;
  }

  private async enrichPayload(tenantId: string, payload: Record<string, unknown>) {
    const settings = await this.ensureTenantSettings(tenantId);
    const enriched: Record<string, unknown> = {
      locale: settings.locale,
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      timezone: settings.timezone,
      ...payload,
    };
    if (payload.total !== undefined && payload.formattedTotal === undefined) {
      enriched.formattedTotal = this.formatCurrency(Number(payload.total), settings.locale, settings.currency);
    }
    if (payload.eta !== undefined && payload.formattedEta === undefined) {
      enriched.formattedEta = this.formatDateTime(String(payload.eta), settings.locale, settings.timezone);
    }
    return enriched;
  }

  private formatCurrency(value: number, locale: string, currency: string) {
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
    } catch {
      return value.toFixed(2);
    }
  }

  private formatDateTime(value: string, locale: string, timezone: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone }).format(date);
    } catch {
      return date.toISOString();
    }
  }

  private typeForEvent(eventName: string): NotificationType {
    if (eventName.startsWith('delivery.')) return NotificationType.DELIVERY_UPDATE;
    if (eventName.startsWith('po.')) return NotificationType.SUPPLIER_PO;
    if (eventName.startsWith('inventory.')) return NotificationType.LOW_STOCK;
    if (eventName.startsWith('forecast.')) return NotificationType.FORECAST_ALERT;
    if (eventName.startsWith('replenishment.')) return NotificationType.REPLENISHMENT;
    return NotificationType.ORDER_STATUS;
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
      text: 'Thanks {{customerName}}. Your order #{{orderNumber}} has been received. Total: {{formattedTotal}}.',
    },
    order_confirmation: {
      subject: 'Order #{{orderNumber}} confirmed',
      text: 'Thanks {{customerName}}. Your order #{{orderNumber}} has been confirmed. Total: {{formattedTotal}}.',
    },
    order_status_preparing: {
      subject: 'Order #{{orderNumber}} is being prepared',
      text: 'Your order is now being prepared.',
    },
    order_ready: {
      subject: 'Your order is ready',
      text: 'Your order #{{orderNumber}} is ready for pickup.',
    },
    order_out_for_delivery: {
      subject: 'Your order is out for delivery',
      text: 'Order #{{orderNumber}} is out for delivery. ETA: {{formattedEta}}.',
    },
    delivery_eta_update: {
      subject: 'Delivery ETA updated',
      text: 'Your delivery ETA is {{formattedEta}}.',
    },
    driver_assignment: {
      subject: 'Driver assigned',
      text: '{{driverName}} has been assigned to delivery task {{deliveryTaskId}}.',
    },
    order_delivered: {
      subject: 'Your order was delivered',
      text: 'Your order #{{orderNumber}} has been delivered.',
    },
    supplier_po_created: {
      subject: 'Purchase order {{purchaseOrderId}} created',
      text: 'A purchase order was created for {{supplierName}}. Total: {{formattedTotal}}.',
    },
    supplier_po_updated: {
      subject: 'Purchase order {{purchaseOrderId}} updated',
      text: 'Purchase order {{purchaseOrderId}} is now {{supplierStatus}}.',
    },
    supplier_po_confirmed: {
      subject: 'Purchase order {{purchaseOrderId}} confirmed',
      text: '{{supplierName}} confirmed purchase order {{purchaseOrderId}}.',
    },
    supplier_po_rejected: {
      subject: 'Purchase order {{purchaseOrderId}} rejected',
      text: '{{supplierName}} rejected purchase order {{purchaseOrderId}}.',
    },
    low_stock: {
      subject: 'Low stock alert: {{itemName}}',
      text: '{{itemName}} is at {{stockLevel}} units. Reorder point is {{reorderPoint}}.',
    },
    forecast_alert: {
      subject: 'Forecast alert: {{title}}',
      text: '{{message}}',
    },
    replenishment_suggestion: {
      subject: 'Replenishment suggestions ready',
      text: '{{itemCount}} items need replenishment. Suggested value: {{suggestedValue}}.',
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
    delivery_eta_update: { subject: 'ETA update', text: 'Delivery ETA: {{formattedEta}}.' },
    driver_assignment: { subject: 'Driver assigned', text: '{{driverName}} assigned to task {{deliveryTaskId}}.' },
    supplier_po_created: { subject: 'PO created', text: 'PO {{purchaseOrderId}} created.' },
    supplier_po_confirmed: { subject: 'PO confirmed', text: 'PO {{purchaseOrderId}} confirmed.' },
    supplier_po_rejected: { subject: 'PO rejected', text: 'PO {{purchaseOrderId}} rejected.' },
    low_stock: { subject: 'Low stock', text: '{{itemName}} low: {{stockLevel}}.' },
    forecast_alert: { subject: 'Forecast alert', text: '{{message}}' },
    replenishment_suggestion: { subject: 'Replenishment', text: '{{itemCount}} replenishment suggestions ready.' },
    system: { subject: 'Business update', text: '{{message}}' },
    marketing: { subject: 'Promotion', text: '{{message}}' },
  },
  [NotificationChannelType.PUSH]: {
    new_order: { subject: 'New order received', text: 'New order received' },
    order_confirmation: { subject: 'Order confirmed', text: 'Order #{{orderNumber}} confirmed' },
    order_status_preparing: { subject: 'Preparing', text: 'Order #{{orderNumber}} is being prepared' },
    order_ready: { subject: 'Ready', text: 'Order #{{orderNumber}} is ready' },
    order_out_for_delivery: { subject: 'Out for delivery', text: 'Order #{{orderNumber}} is on the way' },
    delivery_eta_update: { subject: 'ETA updated', text: '{{formattedEta}}' },
    driver_assignment: { subject: 'Driver assigned', text: '{{driverName}} assigned' },
    supplier_po_created: { subject: 'PO created', text: 'PO {{purchaseOrderId}} created' },
    supplier_po_confirmed: { subject: 'PO confirmed', text: 'PO {{purchaseOrderId}} confirmed' },
    supplier_po_rejected: { subject: 'PO rejected', text: 'PO {{purchaseOrderId}} rejected' },
    low_stock: { subject: 'Low stock alert', text: 'Low stock alert' },
    forecast_alert: { subject: 'Forecast alert', text: '{{message}}' },
    replenishment_suggestion: { subject: 'Replenishment suggestions', text: '{{itemCount}} suggestions ready' },
    system: { subject: 'Business update', text: '{{message}}' },
  },
  [NotificationChannelType.WHATSAPP]: {
    system: { subject: 'Business update', text: '{{message}}' },
  },
  [NotificationChannelType.IN_APP]: {
    system: { subject: 'Business update', text: '{{message}}' },
  },
};

const EVENT_TEMPLATE_MAP: Record<string, string> = {
  'order.created': 'order_confirmation',
  'order.status.updated': 'order_status_{{status}}',
  'delivery.assigned': 'driver_assignment',
  'delivery.eta.updated': 'delivery_eta_update',
  'po.created': 'supplier_po_created',
  'po.updated': 'supplier_po_updated',
  'po.confirmed': 'supplier_po_confirmed',
  'po.rejected': 'supplier_po_rejected',
  'inventory.low': 'low_stock',
  'forecast.alert': 'forecast_alert',
  'replenishment.suggestion': 'replenishment_suggestion',
};
