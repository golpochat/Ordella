import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { IsNull, LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { AuditLogService } from '../../audit/services';
import { ProductEntity } from '../../catalog/entities';
import { DeliveryTaskEntity } from '../../deliveries/entities';
import { StockItemEntity } from '../../inventory/entities';
import { OrderEntity } from '../../orders/entities';
import { LocationEntity } from '../../tenants/entities/location.entity';
import {
  BindEdgeDeviceDto,
  PushOfflineSyncDto,
  ResolveOfflineConflictDto,
  UpdateOfflineLocationSettingDto,
} from '../dto';
import {
  EdgeDeviceEntity,
  OfflineConflictStrategy,
  OfflineLocationSettingEntity,
  OfflineSyncConflictEntity,
  OfflineSyncLogEntity,
  OfflineSyncOperationEntity,
} from '../entities';

const DEFAULT_CURSOR = '0';

@Injectable()
export class OfflineSyncService {
  constructor(
    @InjectRepository(EdgeDeviceEntity)
    private readonly devices: Repository<EdgeDeviceEntity>,
    @InjectRepository(OfflineLocationSettingEntity)
    private readonly settings: Repository<OfflineLocationSettingEntity>,
    @InjectRepository(OfflineSyncOperationEntity)
    private readonly operations: Repository<OfflineSyncOperationEntity>,
    @InjectRepository(OfflineSyncConflictEntity)
    private readonly conflicts: Repository<OfflineSyncConflictEntity>,
    @InjectRepository(OfflineSyncLogEntity)
    private readonly logs: Repository<OfflineSyncLogEntity>,
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    @InjectRepository(StockItemEntity)
    private readonly stockItems: Repository<StockItemEntity>,
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(DeliveryTaskEntity)
    private readonly deliveries: Repository<DeliveryTaskEntity>,
    private readonly auditLogs: AuditLogService,
  ) {}

  async bindDevice(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: BindEdgeDeviceDto) {
    await this.requireLocation(tenant.tenantId, dto.locationId);
    const token = randomBytes(32).toString('hex');
    let device = await this.devices.findOne({
      where: { tenantId: tenant.tenantId, locationId: dto.locationId, deviceFingerprint: dto.deviceFingerprint },
    });
    device ??= this.devices.create({
      tenantId: tenant.tenantId,
      locationId: dto.locationId,
      deviceFingerprint: dto.deviceFingerprint,
    });
    device.deviceType = dto.deviceType;
    device.displayName = dto.displayName;
    device.status = 'active';
    device.offlineTokenHash = this.hash(token);
    device.storageKeyFingerprint = dto.storageKeyFingerprint ?? null;
    device.capabilities = dto.capabilities ?? {};
    device.lastSeenAt = new Date();
    device.updatedAt = new Date();
    const saved = await this.devices.save(device);
    await this.log(tenant.tenantId, dto.locationId, saved.id, 'device_bound', 'info', `Bound ${dto.deviceType} edge device`, { displayName: dto.displayName });
    await this.audit(tenant, user, 'offline_sync.device_bound', 'edge_device', saved.id, { locationId: dto.locationId, deviceType: dto.deviceType });
    return { device: saved, offlineToken: token };
  }

  async bootstrap(tenant: TenantContext, locationId: string, deviceId?: string) {
    await this.requireLocation(tenant.tenantId, locationId);
    const [setting, device, catalogCount, stockCount, openDeliveries] = await Promise.all([
      this.getOrCreateSetting(tenant.tenantId, locationId),
      deviceId ? this.requireDevice(tenant.tenantId, locationId, deviceId) : null,
      this.products.count({ where: { tenantId: tenant.tenantId } }),
      this.stockItems.count({ where: { tenantId: tenant.tenantId, locationId } }),
      this.deliveries.count({ where: { tenantId: tenant.tenantId } }),
    ]);
    if (device) {
      device.lastSeenAt = new Date();
      await this.devices.save(device);
    }
    return {
      locationId,
      setting,
      device,
      cursor: Date.now().toString(),
      localStorageLayer: {
        web: 'IndexedDB with AES-GCM encrypted payloads',
        mobileTablet: 'SQLite/SQLCipher-compatible operation queue',
        sensitiveStores: ['payments', 'offlineTokens', 'customerSnapshots'],
      },
      capabilities: {
        pos: ['sales', 'cart', 'payments', 'receipts', 'promotions'],
        warehouse: ['picking', 'receiving', 'stock_adjustments', 'barcode_scans'],
        delivery: ['driver_tasks', 'status_updates', 'proof_queue'],
        kiosk: ['ordering', 'payments', 'receipt_printing'],
      },
      snapshotSummary: {
        catalogItems: catalogCount,
        stockItems: stockCount,
        openDeliveries,
      },
      conflictRules: this.conflictRules(),
    };
  }

  async deltas(tenant: TenantContext, locationId: string, cursor = DEFAULT_CURSOR) {
    await this.requireLocation(tenant.tenantId, locationId);
    const since = Number(cursor) > 0 ? new Date(Number(cursor)) : new Date(0);
    const operations = await this.operations.find({
      where: { tenantId: tenant.tenantId, locationId, createdAt: MoreThan(since) },
      order: { createdAt: 'ASC' },
      take: 250,
    });
    return {
      cursor: Date.now().toString(),
      operations: operations.map((operation) => ({
        id: operation.id,
        clientMutationId: operation.clientMutationId,
        entityType: operation.entityType,
        entityId: operation.entityId,
        operationType: operation.operationType,
        status: operation.status,
        serverRevision: operation.serverRevision,
        payload: operation.payload,
        serverSnapshot: operation.serverSnapshot,
        createdAt: operation.createdAt,
      })),
    };
  }

  async push(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: PushOfflineSyncDto) {
    await this.requireLocation(tenant.tenantId, dto.locationId);
    const setting = await this.getOrCreateSetting(tenant.tenantId, dto.locationId);
    const device = dto.deviceId ? await this.requireDevice(tenant.tenantId, dto.locationId, dto.deviceId) : null;
    if (setting.requireDeviceBinding && !device) {
      throw new BadRequestException('Device binding is required for offline sync');
    }
    if (!setting.offlineModeEnabled) {
      await this.log(tenant.tenantId, dto.locationId, dto.deviceId ?? null, 'sync_failure', 'warn', 'Offline sync rejected because offline mode is disabled', {});
      throw new BadRequestException('Offline mode is disabled for this location');
    }

    const results: Array<Record<string, unknown>> = [];
    for (const item of dto.operations) {
      const existing = await this.operations.findOne({ where: { tenantId: tenant.tenantId, clientMutationId: item.clientMutationId } });
      if (existing) {
        results.push(this.toResult(existing));
        continue;
      }
      const strategy = this.strategyFor(item.entityType);
      const latestRevision = await this.latestRevision(tenant.tenantId, dto.locationId, item.entityType, item.entityId ?? null);
      const operation = this.operations.create({
        tenantId: tenant.tenantId,
        locationId: dto.locationId,
        deviceId: device?.id ?? null,
        clientMutationId: item.clientMutationId,
        sourceApp: item.sourceApp,
        entityType: item.entityType,
        entityId: item.entityId ?? null,
        operationType: item.operationType,
        baseRevision: item.baseRevision ?? null,
        serverRevision: latestRevision + 1,
        conflictStrategy: strategy,
        payload: this.redactSensitivePayload(item.payload),
        serverSnapshot: await this.serverSnapshot(tenant.tenantId, dto.locationId, item.entityType, item.entityId ?? null),
        attempts: 1,
        occurredAt: new Date(item.occurredAt),
      });
      const conflictType = this.detectConflict(operation, latestRevision, setting);
      if (conflictType) {
        operation.status = 'conflict';
        operation.errorMessage = this.conflictMessage(conflictType);
        operation.nextRetryAt = null;
      } else {
        operation.status = 'applied';
        operation.appliedAt = new Date();
        operation.nextRetryAt = null;
      }
      const saved = await this.operations.save(operation);
      if (conflictType) {
        await this.createConflict(saved, conflictType);
      }
      await this.log(
        tenant.tenantId,
        dto.locationId,
        device?.id ?? null,
        conflictType ? 'conflict_created' : 'offline_action',
        conflictType ? 'warn' : 'info',
        conflictType ? operation.errorMessage ?? 'Offline conflict created' : `Applied offline ${item.entityType} ${item.operationType}`,
        { operationId: saved.id, clientMutationId: item.clientMutationId, strategy },
      );
      results.push(this.toResult(saved));
    }

    if (device) {
      device.lastSeenAt = new Date();
      await this.devices.save(device);
    }
    await this.audit(tenant, user, 'offline_sync.push', 'offline_sync_operation', null, { locationId: dto.locationId, count: dto.operations.length });
    return { results, syncedAt: new Date().toISOString(), nextBackoffSeconds: this.nextBackoffSeconds(results) };
  }

  async listSettings(tenant: TenantContext) {
    const locations = await this.locations.find({ where: { tenantId: tenant.tenantId }, order: { name: 'ASC' } });
    const rows = [];
    for (const location of locations) {
      rows.push(await this.getOrCreateSetting(tenant.tenantId, location.id));
    }
    return rows;
  }

  async updateSetting(tenant: TenantContext, user: AuthenticatedUser | undefined, dto: UpdateOfflineLocationSettingDto) {
    await this.requireLocation(tenant.tenantId, dto.locationId);
    const setting = await this.getOrCreateSetting(tenant.tenantId, dto.locationId);
    Object.assign(setting, {
      offlineModeEnabled: dto.offlineModeEnabled,
      allowPosSales: dto.allowPosSales,
      allowWarehouseOps: dto.allowWarehouseOps,
      allowDeliveryOps: dto.allowDeliveryOps,
      allowKioskOrders: dto.allowKioskOrders,
      requireDeviceBinding: dto.requireDeviceBinding,
      maxOfflineMinutes: dto.maxOfflineMinutes,
      deltaRetentionDays: dto.deltaRetentionDays,
      policy: dto.policy ?? {},
      updatedAt: new Date(),
    });
    const saved = await this.settings.save(setting);
    await this.audit(tenant, user, 'offline_sync.setting_updated', 'offline_location_setting', saved.id, { locationId: dto.locationId });
    return saved;
  }

  async listLogs(tenant: TenantContext, locationId?: string) {
    return this.logs.find({
      where: { tenantId: tenant.tenantId, ...(locationId ? { locationId } : {}) },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async listConflicts(tenant: TenantContext, locationId?: string) {
    return this.conflicts.find({
      where: { tenantId: tenant.tenantId, ...(locationId ? { locationId } : {}), status: 'open' },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async resolveConflict(tenant: TenantContext, user: AuthenticatedUser | undefined, id: string, dto: ResolveOfflineConflictDto) {
    const conflict = await this.conflicts.findOne({ where: { id, tenantId: tenant.tenantId } });
    if (!conflict) throw new NotFoundException('Offline sync conflict not found');
    const operation = await this.operations.findOne({ where: { id: conflict.operationId, tenantId: tenant.tenantId } });
    conflict.status = dto.outcome === 'dismissed' ? 'dismissed' : 'resolved';
    conflict.resolutionOutcome = { outcome: dto.outcome, mergedPayload: dto.mergedPayload ?? null, note: dto.note ?? null };
    conflict.resolvedByUserId = user?.id ?? null;
    conflict.resolvedAt = new Date();
    await this.conflicts.save(conflict);
    if (operation && dto.outcome !== 'dismissed') {
      operation.status = 'applied';
      operation.payload = dto.outcome === 'merged' && dto.mergedPayload ? dto.mergedPayload : operation.payload;
      operation.appliedAt = new Date();
      operation.errorMessage = null;
      await this.operations.save(operation);
    }
    await this.log(tenant.tenantId, conflict.locationId, null, 'conflict_resolved', 'info', `Conflict resolved as ${dto.outcome}`, { conflictId: conflict.id });
    await this.audit(tenant, user, 'offline_sync.conflict_resolved', 'offline_sync_conflict', conflict.id, { outcome: dto.outcome });
    return conflict;
  }

  async forceSync(tenant: TenantContext, user: AuthenticatedUser | undefined, locationId: string) {
    await this.requireLocation(tenant.tenantId, locationId);
    const queued = await this.operations.find({
      where: [
        { tenantId: tenant.tenantId, locationId, status: 'queued' },
        { tenantId: tenant.tenantId, locationId, status: 'failed', nextRetryAt: LessThanOrEqual(new Date()) },
        { tenantId: tenant.tenantId, locationId, status: 'failed', nextRetryAt: IsNull() },
      ],
      take: 100,
    });
    for (const operation of queued) {
      operation.status = 'applied';
      operation.appliedAt = new Date();
      operation.errorMessage = null;
      await this.operations.save(operation);
    }
    await this.log(tenant.tenantId, locationId, null, 'force_sync', 'info', `Force sync processed ${queued.length} operation(s)`, {});
    await this.audit(tenant, user, 'offline_sync.force_sync', 'offline_sync_operation', null, { locationId, count: queued.length });
    return { processed: queued.length, syncedAt: new Date().toISOString() };
  }

  async dashboard(tenant: TenantContext) {
    const [pending, conflicts, failed, devices, logs] = await Promise.all([
      this.operations.count({ where: { tenantId: tenant.tenantId, status: 'queued' } }),
      this.conflicts.count({ where: { tenantId: tenant.tenantId, status: 'open' } }),
      this.operations.count({ where: { tenantId: tenant.tenantId, status: 'failed' } }),
      this.devices.find({ where: { tenantId: tenant.tenantId }, order: { lastSeenAt: 'DESC' }, take: 20 }),
      this.logs.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' }, take: 10 }),
    ]);
    return {
      pendingActions: pending,
      openConflicts: conflicts,
      failedAttempts: failed,
      devices,
      recentLogs: logs,
    };
  }

  private async getOrCreateSetting(tenantId: string, locationId: string) {
    let setting = await this.settings.findOne({ where: { tenantId, locationId } });
    if (!setting) {
      setting = await this.settings.save(this.settings.create({ tenantId, locationId }));
    }
    return setting;
  }

  private async requireLocation(tenantId: string, locationId: string) {
    const location = await this.locations.findOne({ where: { id: locationId, tenantId } });
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  private async requireDevice(tenantId: string, locationId: string, deviceId: string) {
    const device = await this.devices.findOne({ where: { id: deviceId, tenantId, locationId } });
    if (!device || device.status !== 'active') throw new BadRequestException('Edge device is not active for this location');
    return device;
  }

  private strategyFor(entityType: OfflineSyncOperationEntity['entityType']): OfflineConflictStrategy {
    if (entityType === 'inventory_adjustment' || entityType === 'barcode_scan') return 'server_authoritative';
    if (entityType === 'order' || entityType === 'cart') return 'merge';
    if (entityType === 'payment') return 'user_prompt';
    return 'last_write_wins';
  }

  private async latestRevision(tenantId: string, locationId: string, entityType: string, entityId: string | null) {
    const latest = await this.operations.findOne({
      where: { tenantId, locationId, entityType: entityType as never, entityId: entityId ?? IsNull() },
      order: { serverRevision: 'DESC' },
    });
    return latest?.serverRevision ?? 0;
  }

  private detectConflict(operation: OfflineSyncOperationEntity, latestRevision: number, setting: OfflineLocationSettingEntity): OfflineSyncConflictEntity['conflictType'] | null {
    if (!this.sourceAllowed(operation.sourceApp, setting)) return 'offline_disabled';
    if (operation.entityType === 'payment') return 'payment_review';
    if (operation.conflictStrategy === 'server_authoritative') return 'inventory_server_authoritative';
    if (operation.conflictStrategy === 'merge' && operation.baseRevision !== null && operation.baseRevision < latestRevision) return 'complex_merge_required';
    if (operation.baseRevision !== null && operation.baseRevision < latestRevision && operation.conflictStrategy !== 'last_write_wins') return 'revision_mismatch';
    return null;
  }

  private sourceAllowed(sourceApp: OfflineSyncOperationEntity['sourceApp'], setting: OfflineLocationSettingEntity) {
    if (sourceApp === 'pos') return setting.allowPosSales;
    if (sourceApp === 'warehouse') return setting.allowWarehouseOps;
    if (sourceApp === 'delivery') return setting.allowDeliveryOps;
    if (sourceApp === 'kiosk') return setting.allowKioskOrders;
    return false;
  }

  private async createConflict(operation: OfflineSyncOperationEntity, conflictType: OfflineSyncConflictEntity['conflictType']) {
    return this.conflicts.save(this.conflicts.create({
      tenantId: operation.tenantId,
      locationId: operation.locationId,
      operationId: operation.id,
      entityType: operation.entityType,
      entityId: operation.entityId,
      conflictType,
      resolutionStrategy: operation.conflictStrategy === 'last_write_wins' ? 'last_write_wins' : operation.conflictStrategy,
      status: 'open',
      clientPayload: operation.payload,
      serverPayload: operation.serverSnapshot,
      resolutionOutcome: {},
    }));
  }

  private async serverSnapshot(tenantId: string, locationId: string, entityType: OfflineSyncOperationEntity['entityType'], entityId: string | null) {
    if (!entityId) return {};
    if (entityType === 'order') {
      const order = await this.orders.findOne({ where: { tenantId, locationId, id: entityId } });
      return order ? { id: order.id, status: order.status, total: order.total, updatedAt: order.updatedAt } : {};
    }
    if (entityType === 'inventory_adjustment' || entityType === 'barcode_scan') {
      const item = await this.stockItems.findOne({ where: { tenantId, locationId, id: entityId } });
      return item ? { id: item.id, sku: item.sku, quantityOnHand: item.quantityOnHand, updatedAt: item.updatedAt } : {};
    }
    if (entityType === 'delivery_task') {
      const delivery = await this.deliveries.findOne({ where: { tenantId, id: entityId } });
      return delivery ? { id: delivery.id, status: delivery.status, eta: delivery.eta, updatedAt: delivery.updatedAt } : {};
    }
    return {};
  }

  private redactSensitivePayload(payload: Record<string, unknown>) {
    const clone = { ...payload };
    for (const key of ['cardNumber', 'cvv', 'offlineToken', 'authorizationCode']) {
      if (key in clone) clone[key] = '[redacted]';
    }
    return clone;
  }

  private toResult(operation: OfflineSyncOperationEntity) {
    return {
      clientMutationId: operation.clientMutationId,
      operationId: operation.id,
      status: operation.status,
      entityType: operation.entityType,
      entityId: operation.entityId,
      serverRevision: operation.serverRevision,
      conflictStrategy: operation.conflictStrategy,
      message: operation.errorMessage ?? undefined,
    };
  }

  private nextBackoffSeconds(results: Array<Record<string, unknown>>) {
    const failures = results.filter((result) => result.status === 'failed').length;
    return failures ? Math.min(300, 2 ** Math.min(failures, 8)) : 0;
  }

  private conflictMessage(conflictType: OfflineSyncConflictEntity['conflictType']) {
    const messages: Record<OfflineSyncConflictEntity['conflictType'], string> = {
      revision_mismatch: 'Record changed on the server before this offline update synced',
      inventory_server_authoritative: 'Inventory changes require server reconciliation',
      payment_review: 'Offline payment requires human review before settlement',
      duplicate_mutation: 'Duplicate offline mutation',
      complex_merge_required: 'Order or cart changed in multiple places and needs review',
      offline_disabled: 'Offline operation type is disabled for this location',
      device_unbound: 'Device is not bound to this location',
    };
    return messages[conflictType];
  }

  private conflictRules() {
    return {
      simpleFields: 'last_write_wins',
      cartsAndOrders: 'merge_with_user_prompt_on_complex_conflict',
      inventory: 'server_authoritative_reconciliation',
      payments: 'human_review_for_offline_card_or_external_payments',
      deliveryStatus: 'last_write_wins_with_driver_timestamp',
    };
  }

  private async log(tenantId: string, locationId: string | null, deviceId: string | null, eventType: OfflineSyncLogEntity['eventType'], level: OfflineSyncLogEntity['level'], message: string, metadata: Record<string, unknown>) {
    await this.logs.save(this.logs.create({ tenantId, locationId, deviceId, eventType, level, message, metadata }));
  }

  private async audit(tenant: TenantContext, user: AuthenticatedUser | undefined, action: string, entityType: string, entityId: string | null, metadata: Record<string, unknown>) {
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id ?? null,
      action,
      entityType,
      entityId,
      source: 'api',
      riskLevel: action.includes('force') || action.includes('conflict') ? 'high' : 'medium',
      metadata,
    });
  }

  private hash(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }
}
