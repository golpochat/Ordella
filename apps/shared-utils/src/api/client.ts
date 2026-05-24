import {
  ApiClientConfig,
  ApiError,
  ApiErrorBody,
  ApiSuccessResponse,
  RequestOptions,
} from './types';

function buildUrl(baseUrl: string, path: string, params?: RequestOptions['params']): string {
  const url = new URL(path.replace(/^\//, ''), baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export function createApiClient(config: ApiClientConfig) {
  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers(config.defaultHeaders);

    if (!options.skipAuth) {
      const token = config.getAccessToken?.();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    if (!options.skipTenant) {
      const tenantId = config.getTenantId?.();
      if (tenantId) {
        headers.set('X-Tenant-Id', tenantId);
      }
    }

    if (options.headers) {
      const extra = new Headers(options.headers);
      extra.forEach((value, key) => headers.set(key, value));
    }

    let body: BodyInit | undefined;
    if (options.body !== undefined) {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(options.body);
    }

    const response = await fetch(buildUrl(config.baseUrl, path, options.params), {
      ...options,
      headers,
      body,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await response.json().catch(() => null) : null;

    if (!response.ok) {
      const message =
        (payload as { message?: string } | null)?.message ??
        response.statusText ??
        'Request failed';
      throw new ApiError(message, response.status, payload as ApiErrorBody | undefined);
    }

    return payload as T;
  }

  return {
    request,
    get<T>(path: string, options?: Omit<RequestOptions, 'body'>) {
      return request<T>(path, { ...options, method: 'GET' });
    },
    post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) {
      return request<T>(path, { ...options, method: 'POST', body });
    },
    patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) {
      return request<T>(path, { ...options, method: 'PATCH', body });
    },
    put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) {
      return request<T>(path, { ...options, method: 'PUT', body });
    },
    delete<T>(path: string, options?: Omit<RequestOptions, 'body'>) {
      return request<T>(path, { ...options, method: 'DELETE' });
    },
    getData<T>(path: string, options?: Omit<RequestOptions, 'body'>) {
      return request<ApiSuccessResponse<T>>(path, { ...options, method: 'GET' }).then(
        (res) => res.data,
      );
    },
    postData<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) {
      return request<ApiSuccessResponse<T>>(path, { ...options, method: 'POST', body }).then(
        (res) => res.data,
      );
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
