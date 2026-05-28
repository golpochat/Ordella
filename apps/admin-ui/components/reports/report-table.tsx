import type { ReactNode } from 'react';
import {
  AdminTableShell,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/admin-table';

type ReportTableProps = {
  columns: string[];
  rows: Record<string, string | number | ReactNode>[];
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ReportTable({
  columns,
  rows,
  emptyTitle = 'No report rows',
  emptyDescription = 'Adjust the date range or filters to load data for this report.',
}: ReportTableProps) {
  if (rows.length === 0) {
    return (
      <AdminTableShell isEmpty emptyTitle={emptyTitle} emptyDescription={emptyDescription}>
        {null}
      </AdminTableShell>
    );
  }

  return (
    <AdminTableShell>
      <Table>
        <TableHeader sticky>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody zebra>
          {rows.map((row, index) => (
            <TableRow key={index}>
              {columns.map((col) => (
                <TableCell key={col}>{row[col] ?? '—'}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminTableShell>
  );
}
