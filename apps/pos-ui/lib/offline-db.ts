'use client';

import type { PosCatalogCategory, PosCatalogItem } from '@/lib/api';
import type { PosSession } from '@/lib/session';

const DB_NAME = 'ordella-pos-offline';
const DB_VERSION = 1;
const METADATA_STORE = 'metadata';
const PENDING_ORDERS_STORE = 'pendingOrders';
const LOCAL_CUSTOMERS_STORE = 'localCustomers';
const INVENTORY_ADJUSTMENTS_STORE = 'inventoryAdjustments';
const OFFLINE_EVENTS_STORE = 'offlineEvents';

const BOOTSTRAP_KEY = 'bootstrap';
const OPEN_CART_KEY = 'openCart';
const SETTINGS_KEY = 'settings';

export type OfflineSyncStatus = 'pending' | 'syncing' | 'synced' | 'requires_review' | 'failed';

export type OfflineModeSettings = {
  enabled: boolean;
  allowOfflineCardPayments: boolean;
  allowOutOfStockOfflineSales: boolean;
  allowUnknownStockOfflineSales: boolean;
  maxOfflineDurationMinutes: number;
  autoSyncIntervalSeconds: number;
};

export const DEFAULT_OFFLINE_SETTINGS: OfflineModeSettings = {
  enabled: true,
  allowOfflineCardPayments: false,
  allowOutOfStockOfflineSales: false,
  allowUnknownStockOfflineSales: true,
  maxOfflineDurationMinutes: 720,
  autoSyncIntervalSeconds: 30,
};

export type OfflineStaffPermission = {
  staffId: string;
  role?: string | null;
  permissions: string[];
  lastAuthenticatedAt?: string;
};

export type OfflineCustomerSnapshot = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  pointsBalance?: number;
  storeCreditBalance?: string;
};

export type OfflineInventorySnapshot = {
  productId: string;
  stockLevel: number | null;
  stockStatus?: string | null;
  inventoryTrackingEnabled?: boolean;
  updatedAt?: string;
};

export type OfflineBootstrapData = {
  categories: PosCatalogCategory[];
  items: PosCatalogItem[];
  taxes: unknown[];
  discounts: unknown[];
  bundles: unknown[];
  inventory: OfflineInventorySnapshot[];
  customers: OfflineCustomerSnapshot[];
  staffPermissions: OfflineStaffPermission[];
  settings: OfflineModeSettings;
  syncedAt: string;
};

export type OfflineCartLine = {
  productId: string;
  variantId?: string;
  bundleId?: string;
  modifierOptionIds?: string[];
  name: string;
  variantName?: string;
  modifierLabels: string[];
  sku?: string | null;
  unitPrice: number;
  quantity: number;
  stockLevel?: number | null;
  stockStatus?: string | null;
  notes?: string;
  bundleItems?: Array<{ itemId: string; name?: string; quantity: number; isOptional?: boolean }>;
};

export type OfflineOpenCart = {
  id: string;
  session: PosSession;
  lines: OfflineCartLine[];
  discountPercent: number;
  discountFixed: number;
  updatedAt: string;
};

export type OfflineOrderPayload = {
  clientOrderId: string;
  session: PosSession;
  orderType: 'pos' | 'pickup' | 'delivery';
  paymentMethod: 'cash' | 'card' | 'pos' | 'external';
  lines: OfflineCartLine[];
  orderNotes?: string;
  customer?: { name?: string; phone?: string; email?: string; customerId?: string; localCustomerId?: string };
  loyaltyRedeemPoints?: number;
  giftCardCode?: string;
  giftCardAmount?: number;
  storeCreditAmount?: number;
  couponCode?: string;
  discountPercent?: number;
  discountFixed?: number;
  totals: {
    subtotal: string;
    discountTotal: string;
    tax: string;
    taxLines?: Array<{
      taxName: string;
      taxType: string;
      priceMode: string;
      taxRate: string;
      taxableAmount: string;
      taxAmount: string;
      jurisdiction: string;
    }>;
    total: string;
  };
  flags: string[];
  createdAt: string;
};

export type OfflinePendingOrder = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: OfflineSyncStatus;
  attempts: number;
  lastError?: string;
  conflicts: string[];
  syncedOrderId?: string;
  payload: OfflineOrderPayload;
};

export type OfflineInventoryAdjustment = {
  id: string;
  productId: string;
  quantityDelta: number;
  reason: string;
  createdAt: string;
  status: OfflineSyncStatus;
};

export type OfflineEvent = {
  id: string;
  type: 'offline_mode_activated' | 'offline_mode_deactivated' | 'sync_failure' | 'payment_failure';
  payload: Record<string, unknown>;
  createdAt: string;
};

type MetadataRecord<T> = {
  key: string;
  value: T;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

function openDb(): Promise<IDBDatabase> {
  if (!isBrowser()) {
    return Promise.reject(new Error('IndexedDB is not available'));
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(PENDING_ORDERS_STORE)) {
        const store = db.createObjectStore(PENDING_ORDERS_STORE, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(LOCAL_CUSTOMERS_STORE)) {
        db.createObjectStore(LOCAL_CUSTOMERS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(INVENTORY_ADJUSTMENTS_STORE)) {
        const store = db.createObjectStore(INVENTORY_ADJUSTMENTS_STORE, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
      }
      if (!db.objectStoreNames.contains(OFFLINE_EVENTS_STORE)) {
        db.createObjectStore(OFFLINE_EVENTS_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open POS offline database'));
  });
}

async function readStore<T>(storeName: string, key: IDBValidKey): Promise<T | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).get(key);
    request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function writeStore<T>(storeName: string, value: T): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(value);
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

async function deleteFromStore(storeName: string, key: IDBValidKey): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(key);
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

async function listStore<T>(storeName: string): Promise<T[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).getAll();
    request.onsuccess = () => resolve((request.result as T[]) ?? []);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function getMetadata<T>(key: string): Promise<T | null> {
  const record = await readStore<MetadataRecord<T>>(METADATA_STORE, key);
  return record?.value ?? null;
}

async function setMetadata<T>(key: string, value: T): Promise<void> {
  await writeStore<MetadataRecord<T>>(METADATA_STORE, { key, value });
}

export async function saveOfflineBootstrap(data: OfflineBootstrapData): Promise<void> {
  await setMetadata(BOOTSTRAP_KEY, data);
  await setMetadata(SETTINGS_KEY, data.settings);
}

export async function loadOfflineBootstrap(): Promise<OfflineBootstrapData | null> {
  return getMetadata<OfflineBootstrapData>(BOOTSTRAP_KEY);
}

export async function applyOfflineInventorySale(
  lines: Array<{ productId: string; quantity: number }>,
): Promise<void> {
  const bootstrap = await loadOfflineBootstrap();
  if (!bootstrap) return;
  const quantityByProduct = new Map<string, number>();
  for (const line of lines) {
    quantityByProduct.set(line.productId, (quantityByProduct.get(line.productId) ?? 0) + line.quantity);
  }

  const nextInventory = bootstrap.inventory.map((entry) => {
    const sold = quantityByProduct.get(entry.productId) ?? 0;
    if (!sold || entry.stockLevel === null || entry.stockLevel === undefined) return entry;
    const stockLevel = Math.max(0, entry.stockLevel - sold);
    return {
      ...entry,
      stockLevel,
      stockStatus: stockLevel <= 0 ? 'out' : stockLevel <= 5 ? 'low' : 'ok',
      updatedAt: new Date().toISOString(),
    };
  });

  const nextItems = bootstrap.items.map((item) => {
    const sold = quantityByProduct.get(item.id) ?? 0;
    if (!sold || item.stockLevel === null || item.stockLevel === undefined) return item;
    const stockLevel = Math.max(0, item.stockLevel - sold);
    return {
      ...item,
      stockLevel,
      stockStatus: stockLevel <= 0 ? 'out' as const : stockLevel <= 5 ? 'low' as const : 'ok' as const,
      isOutOfStock: stockLevel <= 0,
    };
  });

  await saveOfflineBootstrap({
    ...bootstrap,
    items: nextItems,
    inventory: nextInventory,
  });
}

export async function loadOfflineSettings(): Promise<OfflineModeSettings> {
  return {
    ...DEFAULT_OFFLINE_SETTINGS,
    ...((await getMetadata<Partial<OfflineModeSettings>>(SETTINGS_KEY)) ?? {}),
  };
}

export async function saveOfflineSettings(settings: Partial<OfflineModeSettings>): Promise<void> {
  await setMetadata(SETTINGS_KEY, { ...DEFAULT_OFFLINE_SETTINGS, ...settings });
}

export async function saveOfflineOpenCart(cart: OfflineOpenCart): Promise<void> {
  await setMetadata(OPEN_CART_KEY, cart);
}

export async function loadOfflineOpenCart(): Promise<OfflineOpenCart | null> {
  return getMetadata<OfflineOpenCart>(OPEN_CART_KEY);
}

export async function clearOfflineOpenCart(): Promise<void> {
  await deleteFromStore(METADATA_STORE, OPEN_CART_KEY);
}

export async function savePendingOfflineOrder(order: OfflinePendingOrder): Promise<void> {
  await writeStore(PENDING_ORDERS_STORE, order);
}

export async function listPendingOfflineOrders(): Promise<OfflinePendingOrder[]> {
  const orders = await listStore<OfflinePendingOrder>(PENDING_ORDERS_STORE);
  return orders
    .filter((order) => order.status === 'pending' || order.status === 'failed' || order.status === 'syncing')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getOfflineOrder(id: string): Promise<OfflinePendingOrder | null> {
  return readStore<OfflinePendingOrder>(PENDING_ORDERS_STORE, id);
}

export async function countPendingOfflineOrders(): Promise<number> {
  return (await listPendingOfflineOrders()).length;
}

export async function updateOfflineOrder(
  id: string,
  patch: Partial<Omit<OfflinePendingOrder, 'id' | 'payload'>> & { payload?: OfflineOrderPayload },
): Promise<void> {
  const current = await getOfflineOrder(id);
  if (!current) return;
  await savePendingOfflineOrder({
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

export async function removeOfflineOrder(id: string): Promise<void> {
  await deleteFromStore(PENDING_ORDERS_STORE, id);
}

export async function saveLocalCustomer(customer: OfflineCustomerSnapshot): Promise<void> {
  await writeStore(LOCAL_CUSTOMERS_STORE, customer);
}

export async function listLocalCustomers(): Promise<OfflineCustomerSnapshot[]> {
  return listStore<OfflineCustomerSnapshot>(LOCAL_CUSTOMERS_STORE);
}

export async function saveInventoryAdjustment(adjustment: OfflineInventoryAdjustment): Promise<void> {
  await writeStore(INVENTORY_ADJUSTMENTS_STORE, adjustment);
}

export async function listInventoryAdjustments(): Promise<OfflineInventoryAdjustment[]> {
  return listStore<OfflineInventoryAdjustment>(INVENTORY_ADJUSTMENTS_STORE);
}

export async function removeInventoryAdjustment(id: string): Promise<void> {
  await deleteFromStore(INVENTORY_ADJUSTMENTS_STORE, id);
}

export async function enqueueOfflineEvent(event: Omit<OfflineEvent, 'id' | 'createdAt'>): Promise<void> {
  await writeStore<OfflineEvent>(OFFLINE_EVENTS_STORE, {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...event,
  });
}

export async function listOfflineEvents(): Promise<OfflineEvent[]> {
  return listStore<OfflineEvent>(OFFLINE_EVENTS_STORE);
}

export async function removeOfflineEvent(id: string): Promise<void> {
  await deleteFromStore(OFFLINE_EVENTS_STORE, id);
}
