import type { StockMovement } from '@shared-utils';
import { formatDate } from '@/lib/utils';
import {
  AdminTableShell,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/admin-table';

export function MovementsTable({ movements }: { movements: StockMovement[] }) {
  return (
    <AdminTableShell
      isEmpty={movements.length === 0}
      emptyTitle="No stock movements"
      emptyDescription="Inventory adjustments and transfers will appear here."
    >
      <Table>
        <TableHeader sticky>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Kind</TableHead>
            <TableHead className="text-right tabular-nums">Delta</TableHead>
            <TableHead>Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody zebra>
          {movements.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="whitespace-nowrap">{formatDate(m.createdAt)}</TableCell>
              <TableCell>{m.kind}</TableCell>
              <TableCell className="text-right tabular-nums">{m.quantityDelta}</TableCell>
              <TableCell>{m.reason ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminTableShell>
  );
}
