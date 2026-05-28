import * as React from 'react';
import { cn } from '../../lib/utils';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
}

const gapClass: Record<NonNullable<StackProps['gap']>, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export function Stack({ gap = 'md', align = 'stretch', className, ...props }: StackProps) {
  return (
    <div
      className={cn('flex flex-col', gapClass[gap], align === 'start' && 'items-start', align === 'center' && 'items-center', align === 'end' && 'items-end', align === 'stretch' && 'items-stretch', className)}
      {...props}
    />
  );
}
