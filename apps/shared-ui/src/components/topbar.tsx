import * as React from 'react';
import { cn } from '../lib/utils';
import { Flex } from './layout/flex';

export interface TopbarProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export function Topbar({
  title,
  subtitle,
  leading,
  trailing,
  className,
  ...props
}: TopbarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex h-14 shrink-0 items-center border-b border-border bg-background px-4 min-[769px]:px-6',
        className,
      )}
      {...props}
    >
      <Flex gap="md" align="center" justify="between" className="min-w-0 flex-1">
        <Flex gap="sm" align="center" className="min-w-0 flex-1">
          {leading}
          <div className="min-w-0">
            {title ? <p className="truncate text-sm font-semibold text-foreground">{title}</p> : null}
            {subtitle ? (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </Flex>

        {trailing ? <div className="min-w-0 shrink-0">{trailing}</div> : null}
      </Flex>
    </header>
  );
}
