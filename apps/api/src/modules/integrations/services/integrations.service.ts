import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { CreateIntegrationAppDto } from '../dto';
import { IntegrationAppResponseDto } from '../dto';
import { CreateIntegrationWebhookDto } from '../dto';
import { UpdateIntegrationDto } from '../dto';
import { IntegrationEntity, IntegrationEventEntity, IntegrationLogEntity, IntegrationProviderEntity } from '../entities';
import { IntegrationEventStatus } from '../enums/integration-event-status.enum';
import { IntegrationLogLevel } from '../enums/integration-log-level.enum';
import { IntegrationProviderCategory } from '../enums/integration-provider-category.enum';
import { IntegrationStatus } from '../enums/integration-status.enum';

@Injectable()
export class IntegrationsAppsService {
  constructor(
    @InjectRepository(IntegrationEntity)
    private readonly integrations: Repository<IntegrationEntity>,
    @InjectRepository(IntegrationProviderEntity)
    private readonly providers: Repository<IntegrationProviderEntity>,
    @InjectRepository(IntegrationLogEntity)
    private readonly logs: Repository<IntegrationLogEntity>,
  ) {}

  async findAll(tenant: TenantContext, query: FilterPaginationDto): Promise<IntegrationAppResponseDto[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const apps = await this.integrations.find({
      where: { tenantId: tenant.tenantId },
      relations: { provider: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return apps.map((app) => this.toDto(app));
  }

  async connect(tenant: TenantContext, dto: CreateIntegrationAppDto): Promise<IntegrationAppResponseDto> {
    const provider = await this.providers.findOne({ where: { id: dto.providerId, isActive: true } });
    if (!provider) throw new NotFoundException('Integration provider not found');
    const existing = await this.integrations.findOne({ where: { tenantId: tenant.tenantId, providerId: dto.providerId } });
    const app = existing ?? this.integrations.create({
      tenantId: tenant.tenantId,
      providerId: dto.providerId,
      webhookSecret: this.generateWebhookSecret(),
      credentialsRef: null,
    });
    app.name = dto.name.trim();
    app.config = this.redactSecrets(dto.config ?? {});
    app.status = IntegrationStatus.ACTIVE;
    app.connectedAt = new Date();
    const saved = await this.integrations.save(app);
    await this.writeLog(saved, IntegrationLogLevel.SUCCESS, existing ? 'integration.updated' : 'integration.installed', `${provider.name} connected`, { providerSlug: provider.slug });
    return this.findOne(tenant, saved.id);
  }

  async findOne(tenant: TenantContext, id: string): Promise<IntegrationAppResponseDto> {
    const app = await this.integrations.findOne({ where: { id, tenantId: tenant.tenantId }, relations: { provider: true } });
    if (!app) throw new NotFoundException('Integration app not found');
    return this.toDto(app);
  }

  async update(
    tenant: TenantContext,
    id: string,
    dto: UpdateIntegrationDto,
  ): Promise<IntegrationAppResponseDto> {
    const app = await this.integrations.findOne({ where: { id, tenantId: tenant.tenantId }, relations: { provider: true } });
    if (!app) throw new NotFoundException('Integration app not found');
    if (dto.config !== undefined) app.config = this.redactSecrets(dto.config);
    if (dto.status !== undefined) app.status = dto.status;
    if (dto.status === IntegrationStatus.ACTIVE && !app.connectedAt) app.connectedAt = new Date();
    const saved = await this.integrations.save(app);
    await this.writeLog(saved, IntegrationLogLevel.INFO, 'integration.configured', `${app.provider.name} settings updated`, { status: saved.status });
    return this.toDto(saved);
  }

  async disconnect(tenant: TenantContext, id: string): Promise<void> {
    const app = await this.integrations.findOne({ where: { id, tenantId: tenant.tenantId }, relations: { provider: true } });
    if (!app) throw new NotFoundException('Integration app not found');
    app.status = IntegrationStatus.DISCONNECTED;
    await this.integrations.save(app);
    await this.writeLog(app, IntegrationLogLevel.WARNING, 'integration.uninstalled', `${app.provider.name} disconnected`, {});
  }

  private toDto(app: IntegrationEntity): IntegrationAppResponseDto {
    return {
      id: app.id,
      tenantId: app.tenantId,
      providerId: app.providerId,
      providerSlug: app.provider.slug,
      providerName: app.provider.name,
      providerCategory: app.provider.category as IntegrationProviderCategory,
      name: app.name,
      status: app.status as IntegrationStatus,
      config: app.config,
      connectedAt: app.connectedAt,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  }

  private async writeLog(integration: IntegrationEntity, level: IntegrationLogLevel, action: string, message: string, metadata: Record<string, unknown>): Promise<void> {
    await this.logs.save(this.logs.create({
      tenantId: integration.tenantId,
      integrationId: integration.id,
      level,
      action,
      message,
      metadata,
    }));
  }

  private redactSecrets(config: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(config).map(([key, value]) => (
      /secret|token|password|apiKey|privateKey/i.test(key) ? [key, value ? 'configured' : value] : [key, value]
    )));
  }

  private generateWebhookSecret(): string {
    return `int_whsec_${randomBytes(24).toString('base64url')}`;
  }
}

@Injectable()
export class IntegrationsWebhooksService {
  constructor(
    @InjectRepository(IntegrationEventEntity)
    private readonly events: Repository<IntegrationEventEntity>,
    @InjectRepository(IntegrationEntity)
    private readonly integrations: Repository<IntegrationEntity>,
  ) {}

  receiveDeliveryWebhook(tenant: TenantContext, dto: CreateIntegrationWebhookDto): Promise<{ received: boolean }> {
    return this.recordInbound(tenant, dto, 'delivery.webhook');
  }

  receivePaymentsWebhook(tenant: TenantContext, dto: CreateIntegrationWebhookDto): Promise<{ received: boolean }> {
    return this.recordInbound(tenant, dto, 'payments.webhook');
  }

  receivePosWebhook(tenant: TenantContext, dto: CreateIntegrationWebhookDto): Promise<{ received: boolean }> {
    return this.recordInbound(tenant, dto, 'pos.webhook');
  }

  private async recordInbound(tenant: TenantContext, dto: CreateIntegrationWebhookDto, fallbackType: string): Promise<{ received: boolean }> {
    const integration = await this.integrations.findOne({ where: { id: dto.integrationId, tenantId: tenant.tenantId } });
    if (!integration) throw new NotFoundException('Integration app not found');
    await this.events.save(this.events.create({
      integrationId: integration.id,
      eventType: dto.eventType ?? fallbackType,
      externalId: dto.externalId ?? null,
      payload: dto.payload ?? {},
      status: IntegrationEventStatus.RECEIVED,
      processedAt: null,
    }));
    return { received: true };
  }
}
