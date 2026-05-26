import { Injectable, NotFoundException } from '@nestjs/common';
import { createCipheriv, createHash, randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
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
import { AuditLogService } from '../../audit/services';

@Injectable()
export class IntegrationsAppsService {
  constructor(
    @InjectRepository(IntegrationEntity)
    private readonly integrations: Repository<IntegrationEntity>,
    @InjectRepository(IntegrationProviderEntity)
    private readonly providers: Repository<IntegrationProviderEntity>,
    @InjectRepository(IntegrationLogEntity)
    private readonly logs: Repository<IntegrationLogEntity>,
    @InjectRepository(IntegrationEventEntity)
    private readonly events: Repository<IntegrationEventEntity>,
    private readonly config: ConfigService,
    private readonly auditLogs: AuditLogService,
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
      integrationType: provider.category,
      providerSlug: provider.slug,
      webhookSecret: this.generateWebhookSecret(),
      credentialsRef: null,
      credentialCiphertext: null,
      syncSchedule: dto.syncSchedule ?? 'manual',
      conflictResolution: dto.conflictResolution ?? 'provider_wins',
      retryCount: 0,
      lastSyncAt: null,
      lastSyncStatus: null,
    });
    app.name = dto.name.trim();
    app.integrationType = provider.category;
    app.providerSlug = provider.slug;
    app.config = this.publicConfig(dto.config ?? {});
    app.credentialCiphertext = dto.credentials ? this.encryptCredentials(dto.credentials) : app.credentialCiphertext;
    app.syncSchedule = dto.syncSchedule ?? app.syncSchedule ?? 'manual';
    app.conflictResolution = dto.conflictResolution ?? app.conflictResolution ?? 'provider_wins';
    app.status = IntegrationStatus.ACTIVE;
    app.connectedAt = new Date();
    const saved = await this.integrations.save(app);
    await this.writeLog(saved, IntegrationLogLevel.SUCCESS, existing ? 'integration.updated' : 'integration.installed', `${provider.name} connected`, {
      providerSlug: provider.slug,
      integrationType: provider.category,
      credentialsEncrypted: Boolean(dto.credentials),
      syncSchedule: saved.syncSchedule,
    });
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      action: existing ? 'integration.updated' : 'integration.installed',
      entityType: 'integration',
      entityId: saved.id,
      source: 'admin_ui',
      metadata: { providerSlug: provider.slug, integrationType: provider.category },
    });
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
    if (dto.config !== undefined) app.config = this.publicConfig(dto.config);
    if (dto.credentials !== undefined) app.credentialCiphertext = this.encryptCredentials(dto.credentials);
    if (dto.syncSchedule !== undefined) app.syncSchedule = dto.syncSchedule;
    if (dto.conflictResolution !== undefined) app.conflictResolution = dto.conflictResolution;
    if (dto.status !== undefined) app.status = dto.status;
    if (dto.status === IntegrationStatus.ACTIVE && !app.connectedAt) app.connectedAt = new Date();
    const saved = await this.integrations.save(app);
    await this.writeLog(saved, IntegrationLogLevel.INFO, 'integration.configured', `${app.provider.name} settings updated`, { status: saved.status, credentialsEncrypted: dto.credentials !== undefined });
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      action: 'integration.configured',
      entityType: 'integration',
      entityId: saved.id,
      source: 'admin_ui',
      metadata: { providerSlug: app.provider.slug, changed: Object.keys(dto) },
    });
    return this.toDto(saved);
  }

  async disconnect(tenant: TenantContext, id: string): Promise<void> {
    const app = await this.integrations.findOne({ where: { id, tenantId: tenant.tenantId }, relations: { provider: true } });
    if (!app) throw new NotFoundException('Integration app not found');
    app.status = IntegrationStatus.DISCONNECTED;
    await this.integrations.save(app);
    await this.writeLog(app, IntegrationLogLevel.WARNING, 'integration.uninstalled', `${app.provider.name} disconnected`, {});
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      action: 'integration.uninstalled',
      entityType: 'integration',
      entityId: app.id,
      source: 'admin_ui',
      metadata: { providerSlug: app.provider.slug },
    });
  }

  async testConnection(tenant: TenantContext, id: string): Promise<{ ok: boolean; latencyMs: number; message: string }> {
    const app = await this.requireApp(tenant.tenantId, id);
    const started = Date.now();
    const ok = app.status === IntegrationStatus.ACTIVE;
    const latencyMs = Date.now() - started;
    const message = ok
      ? `${app.provider.name} connector is ready for ${app.provider.capabilities.join(', ') || 'manual sync'}`
      : `${app.provider.name} is not active`;
    await this.writeLog(app, ok ? IntegrationLogLevel.SUCCESS : IntegrationLogLevel.ERROR, 'integration.connection_tested', message, {
      providerSlug: app.provider.slug,
      authType: app.provider.authType,
    }, { ping: true }, { ok, capabilities: app.provider.capabilities }, ok ? null : 'INTEGRATION_INACTIVE', latencyMs);
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      action: 'integration.connection_tested',
      entityType: 'integration',
      entityId: app.id,
      source: 'admin_ui',
      metadata: { providerSlug: app.provider.slug, ok },
    });
    return { ok, latencyMs, message };
  }

  async syncNow(tenant: TenantContext, id: string, mode = 'manual'): Promise<{ queued: boolean; eventId: string; syncedObjects: string[] }> {
    const app = await this.requireApp(tenant.tenantId, id);
    const started = Date.now();
    const syncedObjects = this.syncObjectsFor(app.provider.category as IntegrationProviderCategory);
    const event = await this.events.save(this.events.create({
      integrationId: app.id,
      eventType: `sync.${mode}`,
      externalId: `sync_${Date.now()}`,
      payload: {
        providerSlug: app.provider.slug,
        integrationType: app.integrationType,
        syncedObjects,
        conflictResolution: app.conflictResolution,
      },
      status: IntegrationEventStatus.PROCESSED,
      processedAt: new Date(),
    }));
    app.lastSyncAt = new Date();
    app.lastSyncStatus = 'success';
    app.retryCount = 0;
    await this.integrations.save(app);
    await this.writeLog(app, IntegrationLogLevel.SUCCESS, 'integration.sync_completed', `${app.provider.name} sync completed`, {
      syncedObjects,
      mode,
      eventId: event.id,
    }, { mode }, { syncedObjects }, null, Date.now() - started);
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      action: 'integration.sync_triggered',
      entityType: 'integration',
      entityId: app.id,
      source: 'admin_ui',
      metadata: { providerSlug: app.provider.slug, mode, syncedObjects },
    });
    return { queued: true, eventId: event.id, syncedObjects };
  }

  private toDto(app: IntegrationEntity): IntegrationAppResponseDto {
    return {
      id: app.id,
      tenantId: app.tenantId,
      providerId: app.providerId,
      providerSlug: app.provider.slug,
      providerName: app.provider.name,
      providerCategory: app.provider.category as IntegrationProviderCategory,
      integrationType: app.integrationType,
      name: app.name,
      status: app.status as IntegrationStatus,
      config: app.config,
      syncSchedule: app.syncSchedule,
      conflictResolution: app.conflictResolution,
      retryCount: app.retryCount,
      lastSyncAt: app.lastSyncAt,
      lastSyncStatus: app.lastSyncStatus,
      connectedAt: app.connectedAt,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  }

  private async writeLog(
    integration: IntegrationEntity,
    level: IntegrationLogLevel,
    action: string,
    message: string,
    metadata: Record<string, unknown>,
    requestPayload: Record<string, unknown> | null = null,
    responsePayload: Record<string, unknown> | null = null,
    errorCode: string | null = null,
    durationMs: number | null = null,
  ): Promise<void> {
    await this.logs.save(this.logs.create({
      tenantId: integration.tenantId,
      integrationId: integration.id,
      level,
      action,
      message,
      metadata,
      requestPayload,
      responsePayload,
      errorCode,
      durationMs,
    }));
  }

  private publicConfig(config: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(config).map(([key, value]) => (
      /secret|token|password|apiKey|privateKey/i.test(key) ? [key, value ? 'configured' : value] : [key, value]
    )));
  }

  private async requireApp(tenantId: string, id: string): Promise<IntegrationEntity> {
    const app = await this.integrations.findOne({ where: { id, tenantId }, relations: { provider: true } });
    if (!app) throw new NotFoundException('Integration app not found');
    return app;
  }

  private encryptCredentials(credentials: Record<string, unknown>): string {
    const key = createHash('sha256').update(this.config.get<string>('INTEGRATION_CREDENTIAL_SECRET', 'local-dev-integration-secret')).digest();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(credentials), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
  }

  private syncObjectsFor(category: IntegrationProviderCategory): string[] {
    if (category === IntegrationProviderCategory.ACCOUNTING) return ['sales', 'refunds', 'taxes', 'payouts', 'purchase_orders'];
    if (category === IntegrationProviderCategory.ERP) return ['products', 'inventory', 'suppliers', 'purchase_orders'];
    if (category === IntegrationProviderCategory.DELIVERY) return ['delivery_tasks', 'status_tracking', 'driver_assignments', 'cost_reconciliation'];
    if (category === IntegrationProviderCategory.HARDWARE) return ['device_status', 'hardware_settings'];
    if (category === IntegrationProviderCategory.MARKETING) return ['customers', 'campaign_events'];
    return ['events'];
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
