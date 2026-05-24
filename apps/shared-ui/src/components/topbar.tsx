import * as React from 'react';
import { cn } from '../lib/utils';

export interface TopbarProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export function Topbar({ title, subtitle, leading, trailing, className, ...props }: TopbarProps) {
  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between gap-4 border-b bg-background px-4 md:px-6',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {leading}
        <div className="min-w-0">
          {title ? <h1 className="truncate text-lg font-semibold">{title}</h1> : null}
          {subtitle ? <p className="truncate text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      {trailing ? <div className="flex shrink-0 items-center gap-2">{trailing}</div> : null}
    </header>
  );
}
