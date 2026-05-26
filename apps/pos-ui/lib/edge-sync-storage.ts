'use client';

export type EdgeSourceApp = 'pos' | 'warehouse' | 'delivery' | 'kiosk';
export type EdgeEntityType = 'order' | 'cart' | 'payment' | 'receipt' | 'inventory_adjustment' | 'barcode_scan' | 'delivery_task' | 'promotion_snapshot' | 'warehouse_task';
export type EdgeOperationType = 'create' | 'update' | 'delete' | 'complete' | 'print' | 'scan';
export type EdgeSyncStatus = 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed';

export type EdgeSyncRecord = {
  id: string;
  clientMutationId: string;
  tenantId: string;
  locationId: string;
  deviceId: string;
  sourceApp: EdgeSourceApp;
  entityType: EdgeEntityType;
  entityId?: string | null;
  operationType: EdgeOperationType;
  baseRevision?: number | null;
  encryptedPayload: string;
  status: EdgeSyncStatus;
  attempts: number;
  nextRetryAt?: string | null;
  lastError?: string | null;
  occurredAt: string;
  updatedAt: string;
};

export type EdgeLocalAdapter = {
  kind: 'indexeddb' | 'sqlite';
  enqueue(record: Omit<EdgeSyncRecord, 'encryptedPayload'> & { payload: Record<string, unknown> }): Promise<void>;
  listPending(): Promise<Array<EdgeSyncRecord & { payload: Record<string, unknown> }>>;
  markSynced(id: string): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
};

const DB_NAME = 'ordella-edge-sync';
const DB_VERSION = 1;
const QUEUE_STORE = 'queue';
const KEY_STORE = 'keys';
const STORAGE_KEY = 'edge-sync-key';

function isBrowser() {
  return typeof window !== 'undefined' && 'indexedDB' in window && window.crypto?.subtle;
}

function openDb(): Promise<IDBDatabase> {
  if (!isBrowser()) return Promise.reject(new Error('Encrypted IndexedDB is not available'));
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const store = db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('nextRetryAt', 'nextRetryAt', { unique: false });
        store.createIndex('locationId', 'locationId', { unique: false });
      }
      if (!db.objectStoreNames.contains(KEY_STORE)) {
        db.createObjectStore(KEY_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open edge sync database'));
  });
}

async function getOrCreateCryptoKey(): Promise<CryptoKey> {
  const raw = await readKey();
  if (raw) return window.crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
  const key = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const exported = await window.crypto.subtle.exportKey('raw', key);
  await writeKey(exported);
  return key;
}

async function readKey(): Promise<ArrayBuffer | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(KEY_STORE, 'readonly');
    const request = tx.objectStore(KEY_STORE).get(STORAGE_KEY);
    request.onsuccess = () => resolve((request.result?.value as ArrayBuffer | undefined) ?? null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function writeKey(value: ArrayBuffer): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(KEY_STORE, 'readwrite');
    tx.objectStore(KEY_STORE).put({ key: STORAGE_KEY, value });
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function encryptPayload(payload: Record<string, unknown>): Promise<string> {
  const key = await getOrCreateCryptoKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const cipher = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return `${toBase64(iv)}.${toBase64(new Uint8Array(cipher))}`;
}

async function decryptPayload(value: string): Promise<Record<string, unknown>> {
  const [ivValue, cipherValue] = value.split('.');
  if (!ivValue || !cipherValue) return {};
  const key = await getOrCreateCryptoKey();
  const iv = fromBase64(ivValue);
  const cipher = fromBase64(cipherValue);
  const plain = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return JSON.parse(new TextDecoder().decode(plain)) as Record<string, unknown>;
}

export function createIndexedDbEdgeSyncAdapter(): EdgeLocalAdapter {
  return {
    kind: 'indexeddb',
    async enqueue(record) {
      const encryptedPayload = await encryptPayload(record.payload);
      const stored: EdgeSyncRecord = {
        ...record,
        encryptedPayload,
        status: record.status ?? 'pending',
        attempts: record.attempts ?? 0,
        updatedAt: new Date().toISOString(),
      };
      await writeRecord(stored);
    },
    async listPending() {
      const records = await listRecords();
      const due = records.filter((record) => ['pending', 'failed'].includes(record.status) && (!record.nextRetryAt || new Date(record.nextRetryAt) <= new Date()));
      return Promise.all(due.map(async (record) => ({ ...record, payload: await decryptPayload(record.encryptedPayload) })));
    },
    async markSynced(id) {
      await patchRecord(id, { status: 'synced', nextRetryAt: null, lastError: null });
    },
    async markFailed(id, error) {
      const record = await readRecord(id);
      const attempts = (record?.attempts ?? 0) + 1;
      await patchRecord(id, {
        status: 'failed',
        attempts,
        lastError: error,
        nextRetryAt: new Date(Date.now() + exponentialBackoffMs(attempts)).toISOString(),
      });
    },
  };
}

export function createSqliteEdgeSyncAdapter(): EdgeLocalAdapter {
  throw new Error('SQLite edge sync adapter is provided by the mobile/tablet shell using the same EdgeLocalAdapter contract.');
}

export function exponentialBackoffMs(attempts: number) {
  return Math.min(300_000, 1000 * 2 ** Math.min(attempts, 8));
}

async function writeRecord(record: EdgeSyncRecord): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readwrite');
    tx.objectStore(QUEUE_STORE).put(record);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function readRecord(id: string): Promise<EdgeSyncRecord | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readonly');
    const request = tx.objectStore(QUEUE_STORE).get(id);
    request.onsuccess = () => resolve((request.result as EdgeSyncRecord | undefined) ?? null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function listRecords(): Promise<EdgeSyncRecord[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, 'readonly');
    const request = tx.objectStore(QUEUE_STORE).getAll();
    request.onsuccess = () => resolve((request.result as EdgeSyncRecord[]) ?? []);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function patchRecord(id: string, patch: Partial<EdgeSyncRecord>): Promise<void> {
  const current = await readRecord(id);
  if (!current) return;
  await writeRecord({ ...current, ...patch, updatedAt: new Date().toISOString() });
}

function toBase64(value: Uint8Array) {
  return window.btoa(String.fromCharCode(...value));
}

function fromBase64(value: string) {
  const binary = window.atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
