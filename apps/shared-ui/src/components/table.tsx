import * as React from 'react';
import { cn } from '../lib/utils';
import { odsTableRow } from '../lib/motion';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  zebra?: boolean;
  stickyHeader?: boolean;
  /** Accessible name when the table is a landmark region. */
  'aria-label'?: string;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, zebra, stickyHeader, 'aria-label': ariaLabel, ...props }, ref) => (
    <div
      role={ariaLabel ? 'region' : undefined}
      aria-label={ariaLabel}
      className="relative w-full min-w-0 overflow-x-auto rounded-lg border border-border bg-card shadow-sm"
    >
      <table
        ref={ref}
        className={cn('w-full min-w-[36rem] caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & { sticky?: boolean }
>(({ className, sticky, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      '[&_tr]:border-b [&_tr]:border-border',
      sticky && 'sticky top-0 z-10 bg-card',
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  zebra?: boolean;
}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, zebra, ...props }, ref) => (
    <tbody
      ref={ref}
      data-zebra={zebra ? '' : undefined}
      className={cn(
        '[&_tr:last-child]:border-0',
        zebra && '[&_tr:nth-child(even)]:bg-muted/30',
        className,
      )}
      {...props}
    />
  ),
);
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('border-t border-border bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        `h-10 border-b border-border data-[state=selected]:bg-primary/5 ${odsTableRow}`,
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, scope, ...props }, ref) => (
    <th
      ref={ref}
      scope={scope ?? 'col'}
      className={cn(
        'h-10 px-4 text-left align-middle text-sm font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        'px-4 py-2.5 align-middle text-sm text-foreground [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  ),
);
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
));
TableCaption.displayName = 'TableCaption';

/** Optional outer shell when Table is not used (e.g. custom markup). */
function TableContainer({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative w-full min-w-0 overflow-x-auto rounded-lg border border-border bg-card shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableContainer,
};
