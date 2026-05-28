'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { odsBackdrop } from '../lib/motion';

export {
  odsTransitionColors,
  odsTransitionTransform,
  odsTransitionOpacity,
  odsTransitionShadow,
  odsPressable,
  odsTransitionFocus,
  odsModalOverlay,
  odsModalContent,
  odsModalContentDesktop,
  odsModalContentMobile,
  odsTooltip,
  odsToastEnter,
  odsToastExit,
  odsNavItemSidebar,
  odsNavItemActive,
  odsSidebarWidth,
  odsDrawerPanel,
  odsBackdrop,
  odsSearchContainer,
  odsCardInteractive,
  odsTableRow,
  odsChartTooltip,
} from '../lib/motion';

export type PageTransitionProps = {
  children: React.ReactNode;
  className?: string;
};

/** Route / panel content fade+slide — transform/opacity only. */
export function PageTransition({ children, className }: PageTransitionProps) {
  return <div className={cn('ods-page-enter min-w-0', className)}>{children}</div>;
}

export type StaggerRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Max direct children to stagger (caps animation-delay). */
  maxItems?: number;
};

/** Lightweight staggered reveal for dashboard metric rows (max 6 children). */
export function StaggerReveal({ children, className, maxItems = 6 }: StaggerRevealProps) {
  return (
    <div className={cn('min-w-0', className)}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child) || index >= maxItems) return child;
        return React.cloneElement(child as React.ReactElement<{ className?: string }>, {
          className: cn((child.props as { className?: string }).className, 'ods-stagger-item'),
        });
      })}
    </div>
  );
}

export type MotionOverlayProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/** Mobile nav backdrop — opacity fade only. */
export function MotionOverlay({ className, ...props }: MotionOverlayProps) {
  return (
    <button
      type="button"
      className={cn('fixed inset-0 z-40 bg-foreground/40 opacity-100', odsBackdrop, className)}
      {...props}
    />
  );
}
