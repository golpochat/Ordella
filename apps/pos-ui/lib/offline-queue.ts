const QUEUE_KEY = 'ordella.pos.offlineOrders';

export type OfflineSalePayload = {
  cartId: string;
  orderType: 'pos' | 'pickup' | 'delivery';
  paymentMethod: 'cash' | 'card' | 'pos' | 'external';
  orderNotes?: string;
  customer?: { name?: string; phone?: string; customerId?: string };
};

type QueuedSale = {
  id: string;
  createdAt: string;
  payload: OfflineSalePayload;
};

function readQueue(): QueuedSale[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedSale[];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedSale[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueOfflineSale(payload: OfflineSalePayload): void {
  const queue = readQueue();
  queue.push({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    payload,
  });
  writeQueue(queue);
}

export function listOfflineSales(): QueuedSale[] {
  return readQueue();
}

export function removeOfflineSale(id: string): void {
  writeQueue(readQueue().filter((entry) => entry.id !== id));
}
