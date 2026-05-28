import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InlineProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'baseline';
  wrap?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between';
}

const gapClass: Record<NonNullable<InlineProps['gap']>, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export function Inline({
  gap = 'sm',
  align = 'center',
  wrap = true,
  justify = 'start',
  className,
  ...props
}: InlineProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-row',
        gapClass[gap],
        wrap && 'flex-wrap',
        align === 'start' && 'items-start',
        align === 'center' && 'items-center',
        align === 'end' && 'items-end',
        align === 'baseline' && 'items-baseline',
        justify === 'start' && 'justify-start',
        justify === 'center' && 'justify-center',
        justify === 'end' && 'justify-end',
        justify === 'between' && 'justify-between',
        className,
      )}
      {...props}
    />
  );
}
