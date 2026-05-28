import * as React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { TableHead } from './table';

export type SortDirection = 'asc' | 'desc';

export interface SortableTableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  label: string;
  sorted?: boolean;
  direction?: SortDirection;
  onSort?: () => void;
}

/** ODS sortable column header with asc/desc indicators. */
export function SortableTableHead({
  label,
  sorted = false,
  direction = 'asc',
  onSort,
  className,
  ...props
}: SortableTableHeadProps) {
  return (
    <TableHead className={cn(className)} {...props}>
      <button
        type="button"
        className="inline-flex h-10 items-center gap-1 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={onSort}
        aria-sort={sorted ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        <span>{label}</span>
        {sorted ? (
          direction === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden />
        )}
      </button>
    </TableHead>
  );
}
