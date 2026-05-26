import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HardwareService } from '../services/hardware.service';

@WebSocketGateway({
  namespace: '/devices',
  cors: { origin: true },
})
export class HardwareGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly hardware: HardwareService) {}

  @SubscribeMessage('device.subscribe')
  async subscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { tenantId: string; deviceId: string; token?: string },
  ) {
    if (!payload?.tenantId || !payload.deviceId) return { ok: false };
    client.join(this.deviceRoom(payload.tenantId, payload.deviceId));
    await this.hardware.heartbeat(this.tenant(payload.tenantId), { deviceId: payload.deviceId }, payload.token);
    const commands = await this.hardware.pendingCommands(payload.tenantId, payload.deviceId, payload.token);
    return { ok: true, commands };
  }

  @SubscribeMessage('device.heartbeat')
  async heartbeat(
    @MessageBody() payload: { tenantId: string; deviceId: string; token?: string; firmwareVersion?: string; metrics?: Record<string, unknown> },
  ) {
    const data = await this.hardware.heartbeat(this.tenant(payload.tenantId), {
      deviceId: payload.deviceId,
      firmwareVersion: payload.firmwareVersion,
      metrics: payload.metrics,
    }, payload.token);
    const commands = await this.hardware.pendingCommands(payload.tenantId, payload.deviceId, payload.token);
    return { ok: true, data, commands };
  }

  @SubscribeMessage('device.event')
  async event(
    @MessageBody() payload: { tenantId: string; deviceId: string; token?: string; eventType: 'barcode_scanned' | 'weight_reading' | 'temperature_alert' | 'humidity_alert' | 'door_open' | 'shelf_weight_changed' | 'kiosk_event' | 'printer_status' | 'error'; payload?: Record<string, unknown> },
  ) {
    const data = await this.hardware.ingestEvent(this.tenant(payload.tenantId), {
      deviceId: payload.deviceId,
      eventType: payload.eventType,
      payload: payload.payload,
    }, payload.token);
    return { ok: true, data };
  }

  @SubscribeMessage('device.command.ack')
  async ack(
    @MessageBody() payload: { tenantId: string; commandId: string; token?: string; status: 'acknowledged' | 'failed'; responsePayload?: Record<string, unknown>; errorMessage?: string },
  ) {
    const data = await this.hardware.acknowledgeCommand(this.tenant(payload.tenantId), payload.commandId, {
      status: payload.status,
      responsePayload: payload.responsePayload,
      errorMessage: payload.errorMessage,
    }, payload.token);
    return { ok: true, data };
  }

  emitCommand(tenantId: string, deviceId: string, command: unknown): void {
    this.server?.to(this.deviceRoom(tenantId, deviceId)).emit('device.command', command);
  }

  private deviceRoom(tenantId: string, deviceId: string): string {
    return `tenant:${tenantId}:device:${deviceId}`;
  }

  private tenant(tenantId: string) {
    return { tenantId, source: 'header' as const };
  }
}
