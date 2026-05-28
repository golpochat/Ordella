import * as React from 'react';
import { cn } from '../../lib/utils';

export interface PageContainerProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'main' | 'div' | 'section';
  maxWidth?: 'none' | 'sm' | 'lg';
}

const maxWidthClass: Record<NonNullable<PageContainerProps['maxWidth']>, string> = {
  none: '',
  sm: 'max-w-screen-sm mx-auto w-full',
  lg: 'max-w-7xl mx-auto w-full',
};

/** Scrollable main landmark — shell padding; pair with ContentArea for page rhythm. */
export function PageContainer({
  as: Component = 'main',
  maxWidth = 'none',
  className,
  ...props
}: PageContainerProps) {
  return (
    <Component
      className={cn(
        'flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto bg-surface',
        'p-4 min-[481px]:p-5 min-[769px]:p-6',
        maxWidthClass[maxWidth],
        className,
      )}
      {...props}
    />
  );
}
