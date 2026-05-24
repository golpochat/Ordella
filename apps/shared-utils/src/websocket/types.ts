export type WebSocketMessageHandler<T = unknown> = (payload: T) => void;

export interface WebSocketClientOptions {
  url: string;
  protocols?: string | string[];
  getAccessToken?: () => string | null | undefined;
  getTenantId?: () => string | null | undefined;
  reconnect?: boolean;
  reconnectDelayMs?: number;
  maxReconnectAttempts?: number;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

export type WebSocketConnectionState = 'connecting' | 'open' | 'closed' | 'error';
