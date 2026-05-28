'use client';

import * as React from 'react';
import { memo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, VirtualizedList } from '@shared-ui';

const VIRTUALIZE_THRESHOLD = 80;
const ROW_HEIGHT = 44;

export type AdminVirtualTableColumn<T> = {
  id: string;
  header: React.ReactNode;
  cell: (row: T, index: number) => React.ReactNode;
  className?: string;
};

export type AdminVirtualTableProps<T> = {
  rows: T[];
  columns: AdminVirtualTableColumn<T>[];
  getRowKey: (row: T, index: number) => string;
  'aria-label'?: string;
  maxHeight?: number;
  emptyState?: React.ReactNode;
};

type VirtualCellsProps<T> = {
  row: T;
  index: number;
  columns: AdminVirtualTableColumn<T>[];
};

function VirtualCellsInner<T>({ row, index, columns }: VirtualCellsProps<T>) {
  return (
    <>
      {columns.map((col) => (
        <TableCell key={col.id} className={col.className}>
          {col.cell(row, index)}
        </TableCell>
      ))}
    </>
  );
}

const VirtualCells = memo(VirtualCellsInner) as typeof VirtualCellsInner;

/** Table with windowed body when row count exceeds threshold. */
export function AdminVirtualTable<T>({
  rows,
  columns,
  getRowKey,
  'aria-label': ariaLabel,
  maxHeight = 520,
  emptyState,
}: AdminVirtualTableProps<T>) {
  if (!rows.length) {
    return emptyState ?? null;
  }

  if (rows.length < VIRTUALIZE_THRESHOLD) {
    return (
      <Table aria-label={ariaLabel}>
        <TableHeader sticky>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.id} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody zebra>
          {rows.map((row, index) => (
            <TableRow key={getRowKey(row, index)}>
              <VirtualCells row={row} index={index} columns={columns} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="min-w-0">
      <Table aria-label={ariaLabel}>
        <TableHeader sticky>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.id} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      </Table>
      <VirtualizedList
        items={rows}
        itemHeight={ROW_HEIGHT}
        maxHeight={maxHeight}
        getKey={(row, index) => getRowKey(row, index)}
        className="rounded-b-lg border border-t-0 border-border"
        renderItem={(row, index) => (
          <Table aria-label={ariaLabel} className="w-full">
            <TableBody>
              <TableRow>
                <VirtualCells row={row} index={index} columns={columns} />
              </TableRow>
            </TableBody>
          </Table>
        )}
      />
    </div>
  );
}
