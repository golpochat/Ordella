export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiErrorBody {
  success?: false;
  message?: string;
  code?: string;
  statusCode?: number;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly body?: ApiErrorBody;

  constructor(message: string, status: number, body?: ApiErrorBody) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.code;
    this.body = body;
  }
}

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken?: () => string | null | undefined;
  getTenantId?: () => string | null | undefined;
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  skipAuth?: boolean;
  skipTenant?: boolean;
}
