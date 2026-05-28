import { cn } from '../../lib/utils';
import { Topbar, type TopbarProps } from '../topbar';

export type TopNavProps = TopbarProps;

/**
 * ODS top navigation — fixed elevation shell bar (alias of Topbar with admin shell tokens).
 */
export function TopNav({ className, ...props }: TopNavProps) {
  return <Topbar className={cn('z-50 shrink-0 shadow-sm', className)} {...props} />;
}
