import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { KdsWsEvent } from '../enums/kds-ws-event.enum';

interface KdsSubscribePayload {
  tenantId: string;
  station?: string;
}

@WebSocketGateway({
  namespace: '/kds',
  cors: { origin: true },
})
export class KdsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(KdsGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket): void {
    const tenantId =
      (client.handshake.query.tenantId as string | undefined) ??
      (client.handshake.headers['x-tenant-id'] as string | undefined);

    if (tenantId) {
      client.join(this.tenantRoom(tenantId));
      this.logger.debug(`KDS client connected tenant=${tenantId} id=${client.id}`);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`KDS client disconnected id=${client.id}`);
  }

  @SubscribeMessage('kds.subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: KdsSubscribePayload,
  ): void {
    if (!payload?.tenantId) {
      return;
    }

    client.join(this.tenantRoom(payload.tenantId));
    if (payload.station) {
      client.join(this.stationRoom(payload.tenantId, payload.station));
    }
  }

  broadcastToTenant(
    tenantId: string,
    event: KdsWsEvent,
    payload: unknown,
    station?: string,
  ): void {
    if (!this.server) {
      return;
    }

    this.server.to(this.tenantRoom(tenantId)).emit(event, payload);

    if (station) {
      this.server.to(this.stationRoom(tenantId, station)).emit(event, payload);
    }
  }

  private tenantRoom(tenantId: string): string {
    return `tenant:${tenantId}`;
  }

  private stationRoom(tenantId: string, station: string): string {
    return `tenant:${tenantId}:station:${station}`;
  }
}
