import * as React from 'react';
import { cn } from '../../lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
  /** Responsive: 1 col mobile, `cols` from `md` breakpoint upward. */
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
