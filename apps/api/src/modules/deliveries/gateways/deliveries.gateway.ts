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

interface DeliveriesSubscribePayload {
  tenantId: string;
  driverId: string;
}

@WebSocketGateway({
  namespace: '/deliveries',
  cors: { origin: true },
})
export class DeliveriesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(DeliveriesGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket): void {
    const tenantId =
      (client.handshake.query.tenantId as string | undefined) ??
      (client.handshake.headers['x-tenant-id'] as string | undefined);
    const driverId = client.handshake.query.driverId as string | undefined;

    if (tenantId) {
      client.join(this.tenantRoom(tenantId));
    }
    if (tenantId && driverId) {
      client.join(this.driverRoom(tenantId, driverId));
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Deliveries client disconnected id=${client.id}`);
  }

  @SubscribeMessage('deliveries.subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: DeliveriesSubscribePayload,
  ): void {
    if (!payload?.tenantId) {
      return;
    }
    client.join(this.tenantRoom(payload.tenantId));
    if (payload.driverId) {
      client.join(this.driverRoom(payload.tenantId, payload.driverId));
    }
  }

  broadcastToTenant(tenantId: string, event: string, payload: unknown): void {
    if (!this.server) {
      return;
    }
    this.server.to(this.tenantRoom(tenantId)).emit(event, payload);
  }

  broadcastToDriver(tenantId: string, driverId: string, event: string, payload: unknown): void {
    if (!this.server) {
      return;
    }
    this.server.to(this.driverRoom(tenantId, driverId)).emit(event, payload);
  }

  private tenantRoom(tenantId: string): string {
    return `tenant:${tenantId}`;
  }

  private driverRoom(tenantId: string, driverId: string): string {
    return `driver:${tenantId}:${driverId}`;
  }
}
