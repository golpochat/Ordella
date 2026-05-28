import * as React from 'react';
import { cn } from '../../lib/utils';

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'end' | 'center' | 'between';
  wrap?: boolean;
  direction?: 'row' | 'col';
}

const gapClass: Record<NonNullable<FlexProps['gap']>, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export function Flex({
  gap = 'md',
  align = 'center',
  justify = 'start',
  wrap = false,
  direction = 'row',
  className,
  ...props
}: FlexProps) {
  return (
    <div
      className={cn(
        'flex',
        direction === 'col' ? 'flex-col' : 'flex-row',
        gapClass[gap],
        wrap && 'flex-wrap',
        align === 'start' && 'items-start',
        align === 'center' && 'items-center',
        align === 'end' && 'items-end',
        align === 'stretch' && 'items-stretch',
        align === 'baseline' && 'items-baseline',
        justify === 'start' && 'justify-start',
        justify === 'end' && 'justify-end',
        justify === 'center' && 'justify-center',
        justify === 'between' && 'justify-between',
        className,
      )}
      {...props}
    />
  );
}
