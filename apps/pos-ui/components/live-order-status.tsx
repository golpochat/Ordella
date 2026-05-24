'use client';

import { useKdsOrderStatus } from '@/hooks/use-kds-order-status';

export function LiveOrderStatus({ orderId, fallback }: { orderId: string; fallback: string }) {
  const status = useKdsOrderStatus(orderId);
  return <span>{status ?? fallback}</span>;
}
