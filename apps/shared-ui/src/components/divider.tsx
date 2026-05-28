import * as React from 'react';
import { cn } from '../lib/utils';

export type DividerProps = React.HTMLAttributes<HTMLHRElement>;

export function Divider({ className, ...props }: DividerProps) {
  return <hr className={cn('my-2 border-0 border-t border-border', className)} {...props} />;
}
