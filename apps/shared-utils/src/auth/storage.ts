const ACCESS_TOKEN_KEY = 'ordella.accessToken';
const TENANT_ID_KEY = 'ordella.tenantId';

export type TokenStorage = {
  getAccessToken: () => string | null;
  setAccessToken: (token: string | null) => void;
  getTenantId: () => string | null;
  setTenantId: (tenantId: string | null) => void;
  clear: () => void;
};

function read(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
}

function write(key: string, value: string | null): void {
  if (typeof window === 'undefined') return;
  if (value === null) {
    window.localStorage.removeItem(key);
    return;
  }
  window.localStorage.setItem(key, value);
}

export function createBrowserTokenStorage(): TokenStorage {
  return {
    getAccessToken: () => read(ACCESS_TOKEN_KEY),
    setAccessToken: (token) => write(ACCESS_TOKEN_KEY, token),
    getTenantId: () => read(TENANT_ID_KEY),
    setTenantId: (tenantId) => write(TENANT_ID_KEY, tenantId),
    clear: () => {
      write(ACCESS_TOKEN_KEY, null);
      write(TENANT_ID_KEY, null);
    },
  };
}

export function createMemoryTokenStorage(
  initial: Partial<{ accessToken: string; tenantId: string }> = {},
): TokenStorage {
  let accessToken = initial.accessToken ?? null;
  let tenantId = initial.tenantId ?? null;

  return {
    getAccessToken: () => accessToken,
    setAccessToken: (token) => {
      accessToken = token;
    },
    getTenantId: () => tenantId,
    setTenantId: (id) => {
      tenantId = id;
    },
    clear: () => {
      accessToken = null;
      tenantId = null;
    },
  };
}
