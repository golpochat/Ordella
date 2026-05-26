import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { FindOptionsWhere, LessThan, Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { AuditLogService } from '../../audit/services';
import { InventoryService } from '../../inventory/services/inventory.service';
import { StockAdjustmentType } from '../../inventory/enums/stock-adjustment-type.enum';
import { NotificationsService } from '../../notifications/services';
import { LocationEntity } from '../../tenants/entities';
import {
  AckDeviceCommandDto,
  DeviceHeartbeatDto,
  DispatchDeviceCommandDto,
  HardwareDeviceQueryDto,
  IngestDeviceEventDto,
  RegisterHardwareDeviceDto,
  UpdateHardwareDeviceDto,
} from '../dto';
import {
  HardwareDeviceCommandEntity,
  HardwareDeviceEntity,
  HardwareDeviceEventEntity,
  HardwareDeviceLogEntity,
} from '../entities';

@Injectable()
export class HardwareService {
  constructor(
    @InjectRepository(HardwareDeviceEntity)
    private readonly devices: Repository<HardwareDeviceEntity>,
    @InjectRepository(HardwareDeviceCommandEntity)
    private readonly commands: Repository<HardwareDeviceCommandEntity>,
    @InjectRepository(HardwareDeviceEventEntity)
    private readonly events: Repository<HardwareDeviceEventEntity>,
    @InjectRepository(HardwareDeviceLogEntity)
    private readonly logs: Repository<HardwareDeviceLogEntity>,
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    private readonly inventory: InventoryService,
    private readonly notifications: NotificationsService,
    private readonly auditLogs: AuditLogService,
  ) {}

  async list(tenant: TenantContext, query: HardwareDeviceQueryDto) {
    await this.markOfflineDevices(tenant.tenantId);
    const where: FindOptionsWhere<HardwareDeviceEntity> = {
      tenantId: tenant.tenantId,
      ...(query.locationId ? { locationId: query.locationId } : {}),
      ...(query.deviceType ? { deviceType: query.deviceType as never } : {}),
      ...(query.status ? { status: query.status as never } : {}),
    };
    return this.devices.find({ where, order: { createdAt: 'DESC' } });
  }

  async summary(tenant: TenantContext) {
    await this.markOfflineDevices(tenant.tenantId);
    const devices = await this.devices.find({ where: { tenantId: tenant.tenantId } });
    return {
      total: devices.length,
      online: devices.filter((device) => device.status === 'online').length,
      offline: devices.filter((device) => device.status === 'offline').length,
      error: devices.filter((device) => device.status === 'error').length,
      byType: devices.reduce<Record<string, number>>((acc, device) => {
        acc[device.deviceType] = (acc[device.deviceType] ?? 0) + 1;
        return acc;
      }, {}),
    };
  }

  async register(tenant: TenantContext, dto: RegisterHardwareDeviceDto, user?: AuthenticatedUser) {
    await this.requireLocation(tenant.tenantId, dto.locationId);
    const existing = await this.devices.findOne({ where: { tenantId: tenant.tenantId, deviceId: dto.deviceId } });
    if (existing) throw new BadRequestException('Device ID already registered');
    const token = randomBytes(24).toString('base64url');
    const device = await this.devices.save(this.devices.create({
      tenantId: tenant.tenantId,
      locationId: dto.locationId,
      deviceId: dto.deviceId,
      deviceType: dto.deviceType,
      displayName: dto.displayName.trim(),
      status: 'offline',
      lastHeartbeatAt: null,
      firmwareVersion: dto.firmwareVersion ?? null,
      authTokenHash: this.hashToken(token),
      supportsEncryption: dto.supportsEncryption ?? false,
      config: dto.config ?? {},
      capabilities: dto.capabilities ?? this.defaultCapabilities(dto.deviceType),
    }));
    await this.writeLog(device, 'success', 'device.registered', 'Device registered', { deviceType: device.deviceType });
    await this.audit(tenant, user, 'hardware.device_registered', device.id, { deviceId: device.deviceId, deviceType: device.deviceType });
    return { ...device, authToken: token };
  }

  async update(tenant: TenantContext, id: string, dto: UpdateHardwareDeviceDto, user?: AuthenticatedUser) {
    const device = await this.requireDevice(tenant.tenantId, id);
    if (dto.locationId !== undefined) {
      await this.requireLocation(tenant.tenantId, dto.locationId);
      device.locationId = dto.locationId;
    }
    if (dto.displayName !== undefined) device.displayName = dto.displayName.trim();
    if (dto.status !== undefined) device.status = dto.status;
    if (dto.firmwareVersion !== undefined) device.firmwareVersion = dto.firmwareVersion;
    if (dto.config !== undefined) device.config = dto.config;
    device.updatedAt = new Date();
    const saved = await this.devices.save(device);
    await this.writeLog(saved, 'info', 'device.updated', 'Device configuration updated', { changed: Object.keys(dto) });
    await this.audit(tenant, user, 'hardware.device_updated', saved.id, { changed: Object.keys(dto), locationId: saved.locationId });
    return saved;
  }

  async logsForDevice(tenant: TenantContext, id: string) {
    const device = await this.requireDevice(tenant.tenantId, id);
    return this.logs.find({ where: { tenantId: tenant.tenantId, devicePk: device.id }, order: { createdAt: 'DESC' }, take: 100 });
  }

  async heartbeat(tenant: TenantContext, dto: DeviceHeartbeatDto, token?: string) {
    const device = await this.requireDeviceByDeviceId(tenant.tenantId, dto.deviceId);
    this.assertDeviceToken(device, token);
    device.status = 'online';
    device.lastHeartbeatAt = new Date();
    if (dto.firmwareVersion) device.firmwareVersion = dto.firmwareVersion;
    const saved = await this.devices.save(device);
    await this.events.save(this.events.create({
      tenantId: saved.tenantId,
      locationId: saved.locationId,
      devicePk: saved.id,
      deviceId: saved.deviceId,
      eventType: 'heartbeat',
      payload: dto.metrics ?? {},
      status: 'processed',
    }));
    await this.writeLog(saved, 'success', 'device.heartbeat', 'Heartbeat received', dto.metrics ?? {});
    return saved;
  }

  async dispatchCommand(tenant: TenantContext, id: string, dto: DispatchDeviceCommandDto, user?: AuthenticatedUser) {
    const device = await this.requireDevice(tenant.tenantId, id);
    const command = await this.commands.save(this.commands.create({
      tenantId: tenant.tenantId,
      locationId: device.locationId,
      devicePk: device.id,
      deviceId: device.deviceId,
      commandType: dto.commandType,
      payload: dto.payload ?? {},
      status: 'queued',
      responsePayload: null,
      errorMessage: null,
      sentAt: null,
      acknowledgedAt: null,
    }));
    await this.writeLog(device, 'info', 'device.command_queued', `Command queued: ${dto.commandType}`, { commandId: command.id, payload: dto.payload ?? {} });
    await this.audit(tenant, user, 'hardware.command_dispatched', device.id, { commandId: command.id, commandType: command.commandType });
    return command;
  }

  async pendingCommands(tenantId: string, deviceId: string, token?: string) {
    const device = await this.requireDeviceByDeviceId(tenantId, deviceId);
    this.assertDeviceToken(device, token);
    const commands = await this.commands.find({
      where: { tenantId, deviceId, status: 'queued' },
      order: { createdAt: 'ASC' },
      take: 20,
    });
    for (const command of commands) {
      command.status = 'sent';
      command.sentAt = new Date();
    }
    if (commands.length) await this.commands.save(commands);
    return commands;
  }

  async acknowledgeCommand(tenant: TenantContext, commandId: string, dto: AckDeviceCommandDto, token?: string) {
    const command = await this.commands.findOne({ where: { id: commandId, tenantId: tenant.tenantId } });
    if (!command) throw new NotFoundException('Device command not found');
    const device = await this.requireDevice(tenant.tenantId, command.devicePk);
    this.assertDeviceToken(device, token);
    command.status = dto.status;
    command.responsePayload = dto.responsePayload ?? null;
    command.errorMessage = dto.errorMessage ?? null;
    command.acknowledgedAt = new Date();
    const saved = await this.commands.save(command);
    await this.writeLog(device, dto.status === 'acknowledged' ? 'success' : 'error', 'device.command_acknowledged', `Command ${dto.status}`, {
      commandId,
      commandType: command.commandType,
      response: dto.responsePayload ?? {},
      error: dto.errorMessage ?? null,
    });
    return saved;
  }

  async ingestEvent(tenant: TenantContext, dto: IngestDeviceEventDto, token?: string) {
    const device = await this.requireDeviceByDeviceId(tenant.tenantId, dto.deviceId);
    this.assertDeviceToken(device, token);
    const event = await this.events.save(this.events.create({
      tenantId: tenant.tenantId,
      locationId: device.locationId,
      devicePk: device.id,
      deviceId: device.deviceId,
      eventType: dto.eventType,
      payload: dto.payload ?? {},
      status: 'received',
    }));
    try {
      await this.processAutomation(device, event);
      event.status = 'processed';
      await this.events.save(event);
    } catch (error) {
      event.status = 'failed';
      await this.events.save(event);
      await this.writeLog(device, 'error', 'device.event_failed', error instanceof Error ? error.message : 'Device event failed', { eventType: dto.eventType });
    }
    return event;
  }

  private async processAutomation(device: HardwareDeviceEntity, event: HardwareDeviceEventEntity): Promise<void> {
    if (event.eventType === 'temperature_alert' || event.eventType === 'humidity_alert' || event.eventType === 'door_open') {
      await this.notifications.dispatchEvent(device.tenantId, `iot.${event.eventType}`, {
        templateName: 'iot_alert',
        deviceId: device.deviceId,
        locationId: device.locationId,
        eventType: event.eventType,
        payload: event.payload,
      });
      await this.writeLog(device, 'warning', `iot.${event.eventType}`, 'IoT alert notification queued', event.payload);
    }

    if (event.eventType === 'shelf_weight_changed') {
      const stockItemId = typeof event.payload.stockItemId === 'string' ? event.payload.stockItemId : null;
      const delta = typeof event.payload.quantityDelta === 'number' ? event.payload.quantityDelta : null;
      if (stockItemId && delta && delta !== 0) {
        await this.inventory.adjustStock(device.tenantId, {
          stockItemId,
          locationId: device.locationId,
          type: StockAdjustmentType.COUNT,
          delta,
          reason: `Shelf weight sensor ${device.deviceId}`,
        });
        await this.writeLog(device, 'success', 'iot.shelf_weight_inventory_adjusted', 'Shelf weight event adjusted inventory', { stockItemId, delta });
      }
    }
  }

  private async markOfflineDevices(tenantId: string): Promise<void> {
    const cutoff = new Date(Date.now() - 2 * 60 * 1000);
    const stale = await this.devices.find({
      where: { tenantId, status: 'online', lastHeartbeatAt: LessThan(cutoff) },
    });
    for (const device of stale) {
      device.status = 'offline';
      await this.devices.save(device);
      await this.writeLog(device, 'warning', 'device.offline_detected', 'Device missed heartbeat window', { cutoff: cutoff.toISOString() });
      await this.notifications.dispatchEvent(tenantId, 'device.offline', {
        templateName: 'device_offline',
        deviceId: device.deviceId,
        locationId: device.locationId,
      });
    }
  }

  private async requireLocation(tenantId: string, locationId: string): Promise<LocationEntity> {
    const location = await this.locations.findOne({ where: { id: locationId, tenantId } });
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  private async requireDevice(tenantId: string, id: string): Promise<HardwareDeviceEntity> {
    const device = await this.devices.findOne({ where: { id, tenantId } });
    if (!device) throw new NotFoundException('Device not found');
    return device;
  }

  private async requireDeviceByDeviceId(tenantId: string, deviceId: string): Promise<HardwareDeviceEntity> {
    const device = await this.devices.findOne({ where: { deviceId, tenantId } });
    if (!device) throw new NotFoundException('Device not found');
    return device;
  }

  private assertDeviceToken(device: HardwareDeviceEntity, token?: string): void {
    if (!device.authTokenHash) return;
    if (!token) throw new UnauthorizedException('Device token is required');
    const actual = Buffer.from(this.hashToken(token), 'hex');
    const expected = Buffer.from(device.authTokenHash, 'hex');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      throw new UnauthorizedException('Invalid device token');
    }
  }

  private async writeLog(device: HardwareDeviceEntity, level: 'info' | 'success' | 'warning' | 'error', action: string, message: string, metadata: Record<string, unknown>): Promise<void> {
    await this.logs.save(this.logs.create({
      tenantId: device.tenantId,
      locationId: device.locationId,
      devicePk: device.id,
      deviceId: device.deviceId,
      level,
      action,
      message,
      metadata,
    }));
  }

  private async audit(tenant: TenantContext, user: AuthenticatedUser | undefined, action: string, entityId: string, metadata: Record<string, unknown>): Promise<void> {
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id ?? null,
      locationId: typeof metadata.locationId === 'string' ? metadata.locationId : null,
      action,
      entityType: 'hardware_device',
      entityId,
      source: 'admin_ui',
      riskLevel: action.includes('command') ? 'medium' : 'low',
      metadata,
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private defaultCapabilities(deviceType: string): Record<string, unknown> {
    return {
      print: ['receipt_printer', 'label_printer'].includes(deviceType),
      scan: deviceType === 'barcode_scanner',
      weigh: ['scale', 'shelf_weight_sensor'].includes(deviceType),
      cashDrawer: deviceType === 'cash_drawer',
      display: ['kiosk', 'kds_screen'].includes(deviceType),
      sensors: ['temperature_sensor', 'humidity_sensor', 'door_sensor', 'shelf_weight_sensor'].includes(deviceType),
    };
  }
}
