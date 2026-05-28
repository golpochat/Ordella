import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ScrollContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  axis?: 'x' | 'y' | 'both';
}

export function ScrollContainer({ axis = 'y', className, ...props }: ScrollContainerProps) {
  return (
    <div
      className={cn(
        'min-w-0',
        axis === 'x' && 'overflow-x-auto overflow-y-hidden',
        axis === 'y' && 'overflow-y-auto overflow-x-hidden',
        axis === 'both' && 'overflow-auto',
        className,
      )}
      {...props}
    />
  );
}
