import * as React from 'react';
import { cn } from '../lib/utils';
import { Flex } from './layout/flex';

export interface TableActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/** Right-aligned row action cluster for ODS tables (IconButton group). */
export function TableActions({ children, className, ...props }: TableActionsProps) {
  return (
    <Flex gap="xs" align="center" justify="end" className={cn('shrink-0', className)} {...props}>
      {children}
    </Flex>
  );
}
