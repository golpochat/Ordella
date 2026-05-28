import * as React from 'react';
import { cn } from '../lib/utils';
import { Stack } from './layout/stack';

export interface NavSectionProps {
  title?: string;
  collapsed?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Non-interactive section header + vertical nav item stack. */
export function NavSection({ title, collapsed = false, children, className }: NavSectionProps) {
  return (
    <div className={cn(className)}>
      {title && !collapsed ? (
        <p className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      ) : null}
      <Stack gap="xs">{children}</Stack>
    </div>
  );
}
