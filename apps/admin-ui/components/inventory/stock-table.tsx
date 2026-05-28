'use client';

import { Pencil, SlidersHorizontal } from 'lucide-react';
import type { InventoryListItem } from '@shared-utils';
import { IconButton } from '@shared-ui';
import { InventoryStatusTag } from '@/components/ui/admin-tag';
import {
  AdminTableShell,
  Table,
  TableActions,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/admin-table';

type StockTableProps = {
  items: InventoryListItem[];
  onAdjust: (item: InventoryListItem) => void;
  onEdit: (item: InventoryListItem) => void;
};

export function StockTable({ items, onAdjust, onEdit }: StockTableProps) {
  return (
    <AdminTableShell
      isEmpty={items.length === 0}
      emptyTitle="No inventory items"
      emptyDescription="Stock levels will appear here once products are added."
    >
      <Table>
        <TableHeader sticky>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right tabular-nums">Stock</TableHead>
            <TableHead className="text-right tabular-nums">Reorder</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[1%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody zebra>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.categoryName ?? '—'}</TableCell>
              <TableCell>{item.sku}</TableCell>
              <TableCell className="text-right tabular-nums">{item.stockLevel}</TableCell>
              <TableCell className="text-right tabular-nums">{item.reorderPoint ?? '—'}</TableCell>
              <TableCell>
                <InventoryStatusTag status={item.status} />
              </TableCell>
              <TableCell className="text-right">
                <TableActions>
                  <IconButton
                    size="sm"
                    type="button"
                    aria-label={`Adjust stock for ${item.name}`}
                    onClick={() => onAdjust(item)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    size="sm"
                    type="button"
                    variant="outline"
                    aria-label={`Edit ${item.name}`}
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                </TableActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminTableShell>
  );
}
