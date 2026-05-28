'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import { Flex } from './layout/flex';
import { Stack } from './layout/stack';
import { IconButton } from './icon-button';
import { Select } from './select';

export type PaginationItem = number | 'ellipsis';

/** Build page numbers with ellipsis for large page counts (e.g. 1 … 5 … 10). */
export function getPaginationItems(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
  boundaryCount = 1,
): PaginationItem[] {
  if (totalPages <= 0) return [];
  if (totalPages === 1) return [1];

  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, index) => start + index);

  const totalPageNumbers = siblingCount * 2 + 3 + boundaryCount * 2;
  if (totalPageNumbers >= totalPages) return range(1, totalPages);

  const leftSiblingIndex = Math.max(currentPage - siblingCount, boundaryCount + 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - boundaryCount);

  const shouldShowLeftDots = leftSiblingIndex > boundaryCount + 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - (boundaryCount + 1);

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    return [...range(1, leftItemCount), 'ellipsis', ...range(totalPages - boundaryCount + 1, totalPages)];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    return [...range(1, boundaryCount), 'ellipsis', ...range(totalPages - rightItemCount + 1, totalPages)];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    return [
      ...range(1, boundaryCount),
      'ellipsis',
      ...range(leftSiblingIndex, rightSiblingIndex),
      'ellipsis',
      ...range(totalPages - boundaryCount + 1, totalPages),
    ];
  }

  return range(1, totalPages);
}

function usePaginationSiblingCount(): number {
  const [siblingCount, setSiblingCount] = React.useState(1);

  React.useEffect(() => {
    const tabletMq = window.matchMedia('(max-width: 768px)');
    const mobileMq = window.matchMedia('(max-width: 480px)');

    const update = () => {
      if (mobileMq.matches) setSiblingCount(-1);
      else if (tabletMq.matches) setSiblingCount(0);
      else setSiblingCount(1);
    };

    update();
    tabletMq.addEventListener('change', update);
    mobileMq.addEventListener('change', update);
    return () => {
      tabletMq.removeEventListener('change', update);
      mobileMq.removeEventListener('change', update);
    };
  }, []);

  return siblingCount;
}

export interface PaginationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

/** ODS page number control — 36px min touch, active uses primary semantic tokens. */
export const PaginationButton = React.forwardRef<HTMLButtonElement, PaginationButtonProps>(
  ({ isActive, className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-medium tabular-nums shadow-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:border-border disabled:bg-muted disabled:text-muted-foreground',
        isActive
          ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
          : 'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
        className,
      )}
      {...props}
    />
  ),
);
PaginationButton.displayName = 'PaginationButton';

export interface PaginationEllipsisProps {
  className?: string;
}

/** ODS ellipsis between page ranges. */
export function PaginationEllipsis({ className }: PaginationEllipsisProps) {
  return (
    <span
      aria-hidden
      className={cn('inline-flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground', className)}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export interface PaginationPreviousProps {
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  /** Visible label on mobile (Prev / Next pattern). */
  showLabel?: boolean;
}

export function PaginationPrevious({ disabled, onClick, className, showLabel = true }: PaginationPreviousProps) {
  return (
    <Flex gap="xs" align="center" className={className}>
      <IconButton
        type="button"
        variant="outline"
        size="md"
        aria-label="Previous page"
        disabled={disabled}
        onClick={onClick}
        className="shrink-0"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </IconButton>
      {showLabel ? (
        <span className="text-sm font-medium text-foreground min-[481px]:sr-only">Previous</span>
      ) : null}
    </Flex>
  );
}

export interface PaginationNextProps {
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  showLabel?: boolean;
}

export function PaginationNext({ disabled, onClick, className, showLabel = true }: PaginationNextProps) {
  return (
    <Flex gap="xs" align="center" className={className}>
      {showLabel ? (
        <span className="text-sm font-medium text-foreground min-[481px]:sr-only">Next</span>
      ) : null}
      <IconButton
        type="button"
        variant="outline"
        size="md"
        aria-label="Next page"
        disabled={disabled}
        onClick={onClick}
        className="shrink-0"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </IconButton>
    </Flex>
  );
}

export interface PaginationSummaryProps {
  start: number;
  end: number;
  total: number;
  className?: string;
}

export function PaginationSummary({ start, end, total, className }: PaginationSummaryProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      Showing <span className="font-medium text-foreground tabular-nums">{start}</span>–
      <span className="font-medium text-foreground tabular-nums">{end}</span> of{' '}
      <span className="font-medium text-foreground tabular-nums">{total}</span>
    </p>
  );
}

export interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Page numbers + prev/next — responsive: full desktop, reduced tablet, prev/next mobile. */
export function PaginationControls({ page, totalPages, onPageChange, className }: PaginationControlsProps) {
  const siblingCount = usePaginationSiblingCount();
  const safePage = Math.min(Math.max(1, page), totalPages);
  const showNumbers = siblingCount >= 0;
  const items = showNumbers ? getPaginationItems(safePage, totalPages, Math.max(0, siblingCount)) : [];

  return (
    <Flex gap="xs" align="center" wrap={false} className={cn('min-w-0 max-w-full', className)}>
      <PaginationPrevious disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)} />
      {showNumbers ? (
        <Flex
          gap="xs"
          align="center"
          wrap={false}
          className="hidden min-[481px]:flex min-w-0 overflow-x-hidden"
          aria-label="Page numbers"
        >
          {items.map((item, index) =>
            item === 'ellipsis' ? (
              <PaginationEllipsis key={`ellipsis-${index}`} />
            ) : (
              <PaginationButton
                key={item}
                isActive={item === safePage}
                onClick={() => onPageChange(item)}
                aria-label={`Page ${item}`}
              >
                {item}
              </PaginationButton>
            ),
          )}
        </Flex>
      ) : (
        <span className="text-sm text-muted-foreground tabular-nums min-[481px]:hidden" aria-live="polite">
          Page {safePage} of {totalPages}
        </span>
      )}
      <PaginationNext disabled={safePage >= totalPages} onClick={() => onPageChange(safePage + 1)} />
    </Flex>
  );
}

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

/** ODS table pagination footer — range label, page controls, optional page size. */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  pageSizeOptions = [25, 50, 100],
  onPageSizeChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  return (
    <Stack gap="md" className={cn('mt-6 w-full max-w-full', className)}>
      <nav aria-label="Pagination" className="w-full max-w-full overflow-x-hidden">
        <Flex gap="md" wrap align="center" justify="between" className="w-full max-w-full">
          <PaginationSummary start={start} end={end} total={total} />
          <Flex gap="sm" align="center" wrap className="min-w-0 shrink">
            {onPageSizeChange ? (
              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className="sr-only">Rows per page</span>
                <Select
                  className="h-9 w-auto min-w-[5.5rem] px-2"
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  aria-label="Rows per page"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </Select>
              </label>
            ) : null}
            <PaginationControls page={safePage} totalPages={totalPages} onPageChange={onPageChange} />
          </Flex>
        </Flex>
      </nav>
    </Stack>
  );
}
