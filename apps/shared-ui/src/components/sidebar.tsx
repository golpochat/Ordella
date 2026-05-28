'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { odsSidebarWidth } from '../lib/motion';
import { Divider } from './divider';
import { NavGroup } from './nav-group';
import { NavItem } from './nav-item';
import { Stack } from './layout/stack';

export interface SidebarNavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export interface SidebarSectionConfig {
  id: string;
  title?: string;
  items: SidebarNavItem[];
  /** When true, section can expand/collapse (desktop expanded mode only). */
  collapsible?: boolean;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  brand?: React.ReactNode;
  footer?: React.ReactNode;
  items?: SidebarNavItem[];
  sections?: SidebarSectionConfig[];
  collapsed?: boolean;
  /** Mobile slide-in drawer (fixed positioning applied by shell). */
  drawer?: boolean;
  onNavigate?: () => void;
}

function renderNavItem(
  item: SidebarNavItem,
  collapsed: boolean,
  onNavigate?: () => void,
): React.ReactNode {
  const handleClick = () => {
    item.onClick?.();
    onNavigate?.();
  };

  return (
    <NavItem
      key={item.id}
      label={item.label}
      icon={item.icon}
      active={item.active}
      collapsed={collapsed}
      onClick={handleClick}
    />
  );
}

export function Sidebar({
  brand,
  footer,
  items = [],
  sections,
  collapsed = false,
  drawer = false,
  onNavigate,
  className,
  ...props
}: SidebarProps) {
  const sectionList = sections?.length ? sections : [{ id: 'main', items }];

  return (
    <aside
      aria-label="Primary navigation"
      className={cn(
        `flex h-full flex-col border-r border-border bg-card text-card-foreground shadow-none ${odsSidebarWidth}`,
        collapsed ? 'w-16' : 'w-[240px]',
        drawer && 'h-full max-h-screen',
        className,
      )}
      {...props}
    >
      {brand ? (
        <div
          className={cn(
            'flex h-14 shrink-0 items-center border-b border-border px-4',
            collapsed && 'justify-center px-2',
          )}
        >
          {brand}
        </div>
      ) : null}

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-2" aria-label="Main">
        <Stack gap="md">
          {sectionList.map((section, index) => {
            const itemsNode = section.items.map((item) => renderNavItem(item, collapsed, onNavigate));
            const SectionWrapper = section.collapsible !== false && section.title ? NavGroup : 'div';

            return (
              <React.Fragment key={section.id}>
                {index > 0 ? <Divider /> : null}
                {SectionWrapper === NavGroup ? (
                  <NavGroup title={section.title} collapsed={collapsed} defaultOpen>
                    {itemsNode}
                  </NavGroup>
                ) : (
                  <div>
                    {section.title && !collapsed ? (
                      <p className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {section.title}
                      </p>
                    ) : null}
                    <Stack gap="xs">{itemsNode}</Stack>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </Stack>
      </nav>

      {footer ? (
        <div className={cn('shrink-0 border-t border-border p-4', collapsed && 'px-2')}>{footer}</div>
      ) : null}
    </aside>
  );
}
