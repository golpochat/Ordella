import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../lib/utils';
import { odsNavItemActive, odsNavItemSidebar, odsTransitionColors } from '../lib/motion';
import { Flex } from './layout/flex';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export interface NavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: React.ReactNode;
  active?: boolean;
  collapsed?: boolean;
  variant?: 'sidebar' | 'subnav';
  asChild?: boolean;
}

export function NavItem({
  label,
  icon,
  active = false,
  collapsed = false,
  variant = 'sidebar',
  asChild = false,
  className,
  children,
  ...props
}: NavItemProps) {
  const Comp = asChild ? Slot : 'button';

  const item = (
    <Comp
      type={asChild ? undefined : 'button'}
      aria-current={active ? 'page' : undefined}
      className={cn(
        `w-full font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${odsTransitionColors}`,
        variant === 'sidebar' && [
          odsNavItemSidebar,
          active && odsNavItemActive,
          'min-h-10 rounded-sm text-sm',
          collapsed ? 'flex h-10 items-center justify-center px-0' : 'px-3 ps-4',
          active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        ],
        variant === 'subnav' && [
          'inline-flex min-h-10 items-center rounded-md px-3 py-2 text-sm',
          active
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground active:bg-accent/80',
        ],
        className,
      )}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <Flex
          align="center"
          className={cn('min-w-0', variant === 'sidebar' && !collapsed && 'gap-3')}
        >
          {icon ? icon : null}
          {label && !collapsed ? <span className="truncate text-left">{label}</span> : null}
        </Flex>
      )}
    </Comp>
  );

  if (variant === 'sidebar' && collapsed && label) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{item}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return item;
}
