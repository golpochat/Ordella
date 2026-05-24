import type { WebSocketClientOptions, WebSocketConnectionState, WebSocketMessageHandler } from './types';

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private handlers = new Map<string, Set<WebSocketMessageHandler>>();
  private reconnectAttempts = 0;
  private state: WebSocketConnectionState = 'closed';

  constructor(private readonly options: WebSocketClientOptions) {}

  get connectionState(): WebSocketConnectionState {
    return this.state;
  }

  connect(): void {
    if (typeof WebSocket === 'undefined') {
      throw new Error('WebSocket is not available in this environment');
    }

    const url = this.buildUrl();
    this.state = 'connecting';
    this.socket = new WebSocket(url, this.options.protocols);

    this.socket.addEventListener('open', () => {
      this.state = 'open';
      this.reconnectAttempts = 0;
      this.options.onOpen?.();
    });

    this.socket.addEventListener('message', (event) => {
      this.handleMessage(event.data);
    });

    this.socket.addEventListener('close', (event) => {
      this.state = 'closed';
      this.options.onClose?.(event);
      this.maybeReconnect();
    });

    this.socket.addEventListener('error', (event) => {
      this.state = 'error';
      this.options.onError?.(event);
    });
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
    this.state = 'closed';
  }

  send(event: string, payload: unknown): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }
    this.socket.send(JSON.stringify({ event, payload }));
  }

  on<T = unknown>(event: string, handler: WebSocketMessageHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as WebSocketMessageHandler);

    return () => {
      this.handlers.get(event)?.delete(handler as WebSocketMessageHandler);
    };
  }

  private buildUrl(): string {
    const url = new URL(this.options.url);
    const token = this.options.getAccessToken?.();
    const tenantId = this.options.getTenantId?.();

    if (token) url.searchParams.set('token', token);
    if (tenantId) url.searchParams.set('tenantId', tenantId);

    return url.toString();
  }

  private handleMessage(raw: unknown): void {
    if (typeof raw !== 'string') return;

    try {
      const parsed = JSON.parse(raw) as { event?: string; payload?: unknown };
      const event = parsed.event ?? 'message';
      const handlers = this.handlers.get(event);
      handlers?.forEach((handler) => handler(parsed.payload));
      this.handlers.get('*')?.forEach((handler) => handler(parsed));
    } catch {
      this.handlers.get('message')?.forEach((handler) => handler(raw));
    }
  }

  private maybeReconnect(): void {
    if (!this.options.reconnect) return;

    const max = this.options.maxReconnectAttempts ?? 5;
    if (this.reconnectAttempts >= max) return;

    this.reconnectAttempts += 1;
    const delay = this.options.reconnectDelayMs ?? 1500;

    setTimeout(() => this.connect(), delay);
  }
}

export function createWebSocketClient(options: WebSocketClientOptions): WebSocketClient {
  return new WebSocketClient(options);
}
