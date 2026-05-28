import * as React from 'react';
import { cn } from '../../lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
  /** Responsive: 1 col mobile, `cols` from `md` breakpoint upward. */
  responsive?: boolean;
}

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  /** Responsive: full-width on mobile, span from md breakpoint upward. */
  responsive?: boolean;
}

const colsClass: Record<NonNullable<GridProps['cols']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

const gapClass: Record<NonNullable<GridProps['gap']>, string> = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

const responsiveColsClass: Record<NonNullable<GridProps['cols']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 min-[769px]:grid-cols-2',
  3: 'grid-cols-1 min-[481px]:grid-cols-2 min-[769px]:grid-cols-3',
  4: 'grid-cols-1 min-[481px]:grid-cols-2 min-[1025px]:grid-cols-4',
  6: 'grid-cols-1 min-[481px]:grid-cols-2 min-[769px]:grid-cols-3 min-[1025px]:grid-cols-6',
  12: 'grid-cols-1 min-[769px]:grid-cols-12',
};

export function Grid({ cols = 1, gap = 'md', responsive = false, className, ...props }: GridProps) {
  return (
    <div
      className={cn(
        'grid min-w-0',
        gapClass[gap],
        responsive ? responsiveColsClass[cols] : colsClass[cols],
        className,
      )}
      {...props}
    />
  );
}

const spanClass: Record<NonNullable<GridItemProps['colSpan']>, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  12: 'col-span-12',
};

const responsiveSpanClass: Record<NonNullable<GridItemProps['colSpan']>, string> = {
  1: 'col-span-1',
  2: 'col-span-1 min-[769px]:col-span-2',
  3: 'col-span-1 min-[769px]:col-span-3',
  4: 'col-span-1 min-[769px]:col-span-4',
  5: 'col-span-1 min-[769px]:col-span-5',
  6: 'col-span-1 min-[769px]:col-span-6',
  12: 'col-span-1 min-[769px]:col-span-12',
};

export function GridItem({ colSpan = 1, responsive = false, className, ...props }: GridItemProps) {
  return (
    <div
      className={cn(
        'min-w-0',
        responsive ? responsiveSpanClass[colSpan] : spanClass[colSpan],
        className,
      )}
      {...props}
    />
  );
}
