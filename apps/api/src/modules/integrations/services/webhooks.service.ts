import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHmac, randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { CreateWebhookDto, TestWebhookDto, UpdateWebhookDto } from '../dto';
import { WebhookDeliveryLogEntity, WebhookEntity } from '../entities';

export const SUPPORTED_WEBHOOK_EVENTS = [
  'order.created',
  'order.updated',
  'order.ready',
  'order.delivered',
  'inventory.low',
  'inventory.out',
  'customer.created',
  'customer.updated',
  'payment.succeeded',
  'payment.failed',
  'item.updated',
  'item.outOfStock',
];

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(WebhookEntity)
    private readonly webhooks: Repository<WebhookEntity>,
    @InjectRepository(WebhookDeliveryLogEntity)
    private readonly deliveryLogs: Repository<WebhookDeliveryLogEntity>,
  ) {}

  list(tenant: TenantContext): Promise<WebhookEntity[]> {
    return this.webhooks.find({
      where: { tenantId: tenant.tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  listLogs(tenant: TenantContext): Promise<WebhookDeliveryLogEntity[]> {
    return this.deliveryLogs.find({
      where: { tenantId: tenant.tenantId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async create(tenant: TenantContext, dto: CreateWebhookDto): Promise<WebhookEntity & { secret: string }> {
    this.assertEvents(dto.events);
    const secret = this.generateSecret();
    const webhook = await this.webhooks.save(
      this.webhooks.create({
        tenantId: tenant.tenantId,
        url: dto.url,
        secret,
        events: dto.events,
        isActive: true,
        lastDeliveryAt: null,
      }),
    );
    return Object.assign(webhook, { secret });
  }

  async update(tenant: TenantContext, id: string, dto: UpdateWebhookDto): Promise<WebhookEntity> {
    const webhook = await this.requireWebhook(tenant.tenantId, id);
    if (dto.events) {
      this.assertEvents(dto.events);
      webhook.events = dto.events;
    }
    if (dto.url !== undefined) webhook.url = dto.url;
    if (dto.isActive !== undefined) webhook.isActive = dto.isActive;
    return this.webhooks.save(webhook);
  }

  async disable(tenant: TenantContext, id: string): Promise<WebhookEntity> {
    return this.update(tenant, id, { isActive: false });
  }

  async rotateSecret(tenant: TenantContext, id: string): Promise<WebhookEntity & { secret: string }> {
    const webhook = await this.requireWebhook(tenant.tenantId, id);
    webhook.secret = this.generateSecret();
    const saved = await this.webhooks.save(webhook);
    return Object.assign(saved, { secret: webhook.secret });
  }

  async test(tenant: TenantContext, id: string, dto: TestWebhookDto): Promise<{ delivered: boolean }> {
    const webhook = await this.requireWebhook(tenant.tenantId, id);
    const eventType = dto.eventType ?? 'order.created';
    await this.deliver(webhook, eventType, {
      id: `evt_test_${Date.now()}`,
      type: eventType,
      tenantId: tenant.tenantId,
      test: true,
      createdAt: new Date().toISOString(),
    });
    return { delivered: true };
  }

  async publish(tenantId: string, eventType: string, payload: Record<string, unknown>): Promise<void> {
    const webhooks = await this.webhooks.find({
      where: { tenantId, isActive: true },
    });
    await Promise.all(
      webhooks
        .filter((webhook) => webhook.events.includes(eventType))
        .map((webhook) => this.deliver(webhook, eventType, payload)),
    );
  }

  private async deliver(webhook: WebhookEntity, eventType: string, payload: Record<string, unknown>): Promise<void> {
    const body = JSON.stringify(payload);
    const signature = createHmac('sha256', webhook.secret).update(body).digest('hex');
    let delivered = false;
    for (const attempt of [1, 2, 3]) {
      let statusCode: number | null = null;
      let responseBody: string | null = null;
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Ordella-Event': eventType,
            'X-Ordella-Signature': signature,
          },
          body,
          signal: AbortSignal.timeout(5000),
        });
        statusCode = response.status;
        responseBody = (await response.text()).slice(0, 2000);
        delivered = response.ok;
      } catch (error) {
        responseBody = error instanceof Error ? error.message : 'Delivery failed';
      }
      await this.deliveryLogs.save(
        this.deliveryLogs.create({
          tenantId: webhook.tenantId,
          webhookId: webhook.id,
          eventType,
          attempt,
          statusCode,
          responseBody,
          success: delivered,
          payload,
        }),
      );
      if (delivered) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 250));
    }
    webhook.lastDeliveryAt = new Date();
    await this.webhooks.save(webhook);
  }

  private async requireWebhook(tenantId: string, id: string): Promise<WebhookEntity> {
    const webhook = await this.webhooks.findOne({ where: { id, tenantId } });
    if (!webhook) throw new NotFoundException('Webhook not found');
    return webhook;
  }

  private assertEvents(events: string[]): void {
    const invalid = events.filter((event) => !SUPPORTED_WEBHOOK_EVENTS.includes(event));
    if (invalid.length) throw new BadRequestException(`Unsupported webhook events: ${invalid.join(', ')}`);
  }

  private generateSecret(): string {
    return `whsec_${randomBytes(24).toString('base64url')}`;
  }
}
