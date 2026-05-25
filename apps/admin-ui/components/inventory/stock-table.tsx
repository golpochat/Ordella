'use client';

import type { InventoryListItem } from '@shared-utils';
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';

const STATUS_LABEL: Record<InventoryListItem['status'], string> = {
  ok: 'OK',
  low: 'Low stock',
  out: 'Out of stock',
};

const STATUS_VARIANT: Record<
  InventoryListItem['status'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  ok: 'secondary',
  low: 'outline',
  out: 'destructive',
};

type StockTableProps = {
  items: InventoryListItem[];
  onAdjust: (item: InventoryListItem) => void;
  onEdit: (item: InventoryListItem) => void;
};

export function StockTable({ items, onAdjust, onEdit }: StockTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead className="text-right">Stock</TableHead>
          <TableHead className="text-right">Reorder</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.categoryName ?? '—'}</TableCell>
            <TableCell>{item.sku}</TableCell>
            <TableCell className="text-right">{item.stockLevel}</TableCell>
            <TableCell className="text-right">{item.reorderPoint ?? '—'}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[item.status]}>{STATUS_LABEL[item.status]}</Badge>
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onAdjust(item)}>
                Adjust
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(item)}>
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
