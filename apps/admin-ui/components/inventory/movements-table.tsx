import type { StockMovement } from '@shared-utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { formatDate } from '@/lib/utils';

export function MovementsTable({ movements }: { movements: StockMovement[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Kind</TableHead>
          <TableHead>Delta</TableHead>
          <TableHead>Reason</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((m) => (
          <TableRow key={m.id}>
            <TableCell>{formatDate(m.createdAt)}</TableCell>
            <TableCell>{m.kind}</TableCell>
            <TableCell>{m.quantityDelta}</TableCell>
            <TableCell>{m.reason ?? '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
