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

export function ReceiptScreen({ orderId }: { orderId?: string }) {
  const [receipt, setReceipt] = useState<PosReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    getReceipt(orderId)
      .then(setReceipt)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load receipt'));
  }, [orderId]);

  const totalQty = useMemo(
    () => (receipt ? receipt.items.reduce((sum, i) => sum + i.quantity, 0) : 0),
    [receipt],
  );

  return (
    <div className="mx-auto max-w-3xl p-4 print:max-w-full">
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>Receipt</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? <p className="text-destructive">{error}</p> : null}
          {!receipt ? <p>Loading…</p> : null}
          {receipt ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
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
                      <TableCell>{item.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="space-y-1 text-sm">
                <p>Total qty: {totalQty}</p>
                <p>Subtotal: {receipt.subtotal}</p>
                {Number(receipt.discountTotal ?? 0) > 0 ? (
                  <>
                    <p>Discount: -{receipt.discountTotal}</p>
                    {receipt.appliedPromotions?.map((promotion) => (
                      <p key={promotion.promotionId} className="text-muted-foreground">
                        Promotion {promotion.code ?? promotion.promotionId.slice(0, 8)}: -{promotion.discountAmount}
                      </p>
                    ))}
                  </>
                ) : null}
                <p>Tax: {receipt.tax}</p>
                <p className="text-lg font-semibold">Total: {receipt.total}</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
      <div className="mt-4 flex gap-2 print:hidden">
        <Button className="h-12" onClick={() => window.print()}>
          Print
        </Button>
      </div>
    </div>
  );
}
