import type { InventoryItem } from '@shared-utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';

export function StockTable({ items }: { items: InventoryItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>On hand</TableHead>
          <TableHead>Reserved</TableHead>
          <TableHead>Available</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.sku}</TableCell>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.quantityOnHand}</TableCell>
            <TableCell>{item.quantityReserved}</TableCell>
            <TableCell>{item.quantityAvailable ?? '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
