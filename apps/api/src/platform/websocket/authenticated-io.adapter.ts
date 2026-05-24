import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions, Socket } from 'socket.io';

/**
 * Validates JWT on WebSocket handshake (query.token or Authorization header).
 * Does not modify domain gateways — applied globally at bootstrap.
 */
export class AuthenticatedIoAdapter extends IoAdapter {
  private readonly logger = new Logger(AuthenticatedIoAdapter.name);
  private readonly jwtService: JwtService;
  private readonly jwtSecret: string;
  private readonly requireAuth: boolean;

  constructor(app: INestApplicationContext) {
    super(app);
    this.jwtService = app.get(JwtService);
    const config = app.get(ConfigService);
    this.jwtSecret = config.get<string>('JWT_SECRET', 'change-me-local-dev-only');
    this.requireAuth = config.get<string>('WS_REQUIRE_AUTH', 'false') === 'true';
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: (process.env.CORS_ORIGINS ?? '*').split(',').map((o) => o.trim()),
        credentials: true,
      },
    });

    server.use((socket: Socket, next: (err?: Error) => void) => {
      if (!this.requireAuth) {
        return next();
      }

      const token =
        (socket.handshake.auth?.token as string | undefined) ??
        (socket.handshake.query?.token as string | undefined) ??
        this.extractBearer(socket.handshake.headers.authorization);

      if (!token) {
        return next(new Error('WebSocket authentication required'));
      }

      try {
        const payload = this.jwtService.verify(token, { secret: this.jwtSecret });
        socket.data.user = payload;
        const tenantId =
          (socket.handshake.query.tenantId as string | undefined) ??
          (socket.handshake.headers['x-tenant-id'] as string | undefined);
        if (tenantId) {
          socket.data.tenantId = tenantId;
        }
        return next();
      } catch {
        this.logger.warn(`WS auth failed for ${socket.id}`);
        return next(new Error('Invalid WebSocket token'));
      }
    });

    return server;
  }

  private extractBearer(header: string | undefined): string | undefined {
    if (!header?.startsWith('Bearer ')) {
      return undefined;
    }
    return header.slice(7);
  }
}
