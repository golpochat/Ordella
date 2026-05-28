'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { Flex } from './layout/flex';
import { Stack } from './layout/stack';

export interface NavGroupProps {
  title?: string;
  collapsed?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Collapsible navigation group with section header control. */
export function NavGroup({
  title,
  collapsed = false,
  defaultOpen = true,
  children,
  className,
}: NavGroupProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  React.useEffect(() => {
    if (collapsed) {
      setOpen(true);
    }
  }, [collapsed]);

  if (!title || collapsed) {
    return (
      <div className={className}>
        <Stack gap="xs">{children}</Stack>
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      <button
        type="button"
        className={cn(
          'flex h-10 w-full items-center rounded-sm px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground',
          'transition-colors hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        )}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Flex align="center" justify="between" className="w-full gap-2">
          <span className="truncate text-left">{title}</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 transition-transform duration-normal ease-out motion-reduce:transition-none',
              open && 'rotate-180',
            )}
            aria-hidden
          />
        </Flex>
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-normal ease-in-out motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <Stack gap="xs" className="pt-1">
            {children}
          </Stack>
        </div>
      </div>
    </div>
  );
}
