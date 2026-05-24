import * as React from 'react';
import { cn } from '../lib/utils';

export interface SidebarNavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  brand?: React.ReactNode;
  footer?: React.ReactNode;
  items: SidebarNavItem[];
  collapsed?: boolean;
}

export function Sidebar({ brand, footer, items, collapsed = false, className, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-card text-card-foreground',
        collapsed ? 'w-16' : 'w-64',
        className,
      )}
      {...props}
    >
      {brand ? (
        <div className={cn('flex h-14 items-center border-b px-4', collapsed && 'justify-center px-2')}>
          {brand}
        </div>
      ) : null}

      <nav className="flex-1 space-y-1 p-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
              item.active && 'bg-accent text-accent-foreground',
              collapsed && 'justify-center px-2',
            )}
          >
            {item.icon}
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
          </button>
        ))}
      </nav>

      {footer ? (
        <div className={cn('border-t p-4', collapsed && 'px-2')}>{footer}</div>
      ) : null}
    </aside>
  );
}
