'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared-ui';
import { getReceipt, type PosReceipt } from '@/lib/api';
import { LiveOrderStatus } from '@/components/live-order-status';
import { useTenantSettings } from '@/hooks/use-tenant-settings';
import { getOfflineOrder, type OfflinePendingOrder } from '@/lib/offline-db';

export function ReceiptScreen({ orderId, offline = false }: { orderId?: string; offline?: boolean }) {
  const { settings, formatCurrency, formatDateTime } = useTenantSettings();
  const [receipt, setReceipt] = useState<PosReceipt | null>(null);
  const [offlineOrder, setOfflineOrder] = useState<OfflinePendingOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    if (offline) {
      getOfflineOrder(orderId)
        .then((order) => {
          setOfflineOrder(order);
          if (!order) setError('Pending offline receipt not found');
        })
        .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load offline receipt'));
      return;
    }
    getReceipt(orderId)
      .then(setReceipt)
      .catch(async (e) => {
        const local = await getOfflineOrder(orderId);
        if (local) {
          setOfflineOrder(local);
          return;
        }
        setError(e instanceof Error ? e.message : 'Failed to load receipt');
      });
  }, [offline, orderId]);

  const totalQty = useMemo(
    () =>
      receipt
        ? receipt.items.reduce((sum, i) => sum + i.quantity, 0)
        : offlineOrder?.payload.lines.reduce((sum, i) => sum + i.quantity, 0) ?? 0,
    [offlineOrder, receipt],
  );

  return (
    <div className="mx-auto max-w-3xl p-[var(--pos-panel-padding)] print:max-w-full">
      <Card className="overflow-hidden rounded-[var(--pos-radius)] print:shadow-none">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle>{settings.currencySymbol ? 'Receipt Preview' : 'Receipt'}</CardTitle>
          <p className="text-sm opacity-80">{formatDateTime(new Date())}</p>
        </CardHeader>
        <CardContent>
          {error ? <p className="text-destructive">{error}</p> : null}
          {!receipt && !offlineOrder ? <p>Loading…</p> : null}
          {offlineOrder ? (
            <div className="space-y-4">
              <div className="rounded-[var(--pos-radius)] border bg-muted p-3 text-sm text-muted-foreground">
                This receipt is pending sync. It will be finalized automatically when the connection returns.
              </div>
              <div className="grid gap-2 rounded-[var(--pos-radius)] border bg-muted/40 p-[var(--pos-panel-padding)] text-sm sm:grid-cols-2">
                <p>Order: {offlineOrder.payload.clientOrderId.slice(0, 8)}</p>
                <p>Status: Pending Sync</p>
                <p>Cashier: {offlineOrder.payload.session.cashierId}</p>
                <p>Terminal: {offlineOrder.payload.session.terminalId}</p>
                <p>Shift: {offlineOrder.payload.session.shiftId}</p>
                <p>Location: {offlineOrder.payload.session.locationId}</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offlineOrder.payload.lines.map((item, idx) => (
                    <TableRow key={`${item.productId}-${idx}`}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="space-y-1 rounded-[var(--pos-radius)] border bg-muted/30 p-[var(--pos-panel-padding)] text-sm">
                <p>Total qty: {totalQty}</p>
                <p>Subtotal: {formatCurrency(offlineOrder.payload.totals.subtotal)}</p>
                {Number(offlineOrder.payload.totals.discountTotal) > 0 ? (
                  <p>Discount: -{formatCurrency(offlineOrder.payload.totals.discountTotal)}</p>
                ) : null}
                {(offlineOrder.payload.totals.taxLines ?? []).length ? (
                  offlineOrder.payload.totals.taxLines?.map((line) => (
                    <p key={`${line.taxName}-${line.taxAmount}`}>
                      {line.taxName} ({line.taxRate}%): {formatCurrency(line.taxAmount)}
                    </p>
                  ))
                ) : (
                  <p>Tax: {formatCurrency(offlineOrder.payload.totals.tax)}</p>
                )}
                <p className="text-lg font-semibold">Total: {formatCurrency(offlineOrder.payload.totals.total)}</p>
              </div>
            </div>
          ) : null}
          {receipt ? (
            <div className="space-y-4">
              <div className="grid gap-2 rounded-[var(--pos-radius)] border bg-muted/40 p-[var(--pos-panel-padding)] text-sm sm:grid-cols-2">
                <p>Order: {receipt.orderNumber ?? receipt.orderId.slice(0, 8)}</p>
                <p>Status: <LiveOrderStatus orderId={receipt.orderId} fallback={receipt.status} /></p>
                <p>Cashier: {receipt.cashierId}</p>
                <p>Terminal: {receipt.terminalId}</p>
                <p>Shift: {receipt.shiftId}</p>
                <p>Location: {receipt.locationId}</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipt.items.map((item, idx) => (
                    <TableRow key={`${item.productId}-${idx}`}>
                      <TableCell>{item.productId}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="space-y-1 rounded-[var(--pos-radius)] border bg-muted/30 p-[var(--pos-panel-padding)] text-sm">
                <p>Total qty: {totalQty}</p>
                <p>Subtotal: {formatCurrency(receipt.subtotal)}</p>
                {Number(receipt.discountTotal ?? 0) > 0 ? (
                  <>
                    <p>Discount: -{formatCurrency(receipt.discountTotal)}</p>
                    {receipt.appliedPromotions?.map((promotion) => (
                      <p key={promotion.promotionId} className="text-muted-foreground">
                        Promotion {promotion.code ?? promotion.promotionId.slice(0, 8)}: -{formatCurrency(promotion.discountAmount)}
                      </p>
                    ))}
                  </>
                ) : null}
                {receipt.taxLines.length ? (
                  receipt.taxLines.map((line) => (
                    <p key={`${line.taxName}-${line.taxAmount}`}>
                      {line.taxName} ({Number(line.taxRate).toFixed(2)}%, {line.priceMode}): {formatCurrency(line.taxAmount)}
                    </p>
                  ))
                ) : (
                  <p>Tax: {formatCurrency(receipt.tax)}</p>
                )}
                <p className="text-lg font-semibold">Total: {formatCurrency(receipt.total)}</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
      <div className="mt-4 flex gap-2 print:hidden">
        <Button className="h-[var(--pos-button-height)] rounded-[var(--pos-radius)]" onClick={() => window.print()}>
          Print
        </Button>
      </div>
    </div>
  );
}
