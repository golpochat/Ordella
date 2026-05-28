import * as React from 'react';
import { cn } from '../lib/utils';
import { Flex } from './layout/flex';
import { Stack } from './layout/stack';

export interface EmptyStateIconProps {
  children: React.ReactNode;
  className?: string;
}

/** 48px icon slot on the 8px grid. */
export function EmptyStateIcon({ children, className }: EmptyStateIconProps) {
  return (
    <span
      className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  );
}

export interface EmptyStateTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function EmptyStateTitle({ children, className, ...props }: EmptyStateTitleProps) {
  return (
    <h3 className={cn('text-base font-semibold text-foreground', className)} {...props}>
      {children}
    </h3>
  );
}

export interface EmptyStateDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function EmptyStateDescription({ children, className, ...props }: EmptyStateDescriptionProps) {
  return (
    <p className={cn('max-w-md text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
}

export interface EmptyStateActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function EmptyStateActions({ children, className }: EmptyStateActionsProps) {
  return (
    <Flex gap="sm" wrap justify="center" className={className}>
      {children}
    </Flex>
  );
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  /** `compact` — nested inside cards/sections; `default` — full-width centered panel. */
  size?: 'default' | 'compact';
  className?: string;
  children?: React.ReactNode;
}

/** Centered empty list/table/chart state with optional CTA. */
export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  size = 'default',
  className,
  children,
}: EmptyStateProps) {
  const actions = action || secondaryAction ? (
    <EmptyStateActions>
      {action}
      {secondaryAction}
    </EmptyStateActions>
  ) : null;

  if (children) {
    return (
      <div
        className={cn(
          'mx-auto flex w-full max-w-lg justify-center',
          size === 'compact' ? 'py-6' : 'py-12',
          className,
        )}
        role="status"
        aria-label={title}
      >
        <Stack gap="md" align="center" className="items-center px-4 text-center">
          {children}
          {actions}
        </Stack>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'mx-auto w-full max-w-lg text-center',
        size === 'default' && 'rounded-lg border border-border bg-card px-6 py-12 shadow-sm',
        size === 'compact' && 'px-4 py-8',
        className,
      )}
      role="status"
      aria-label={title}
    >
      <Stack gap="md" align="center" className="items-center">
        {icon ? <EmptyStateIcon>{icon}</EmptyStateIcon> : null}
        <Stack gap="xs" align="center" className="items-center">
          <EmptyStateTitle>{title}</EmptyStateTitle>
          {description ? <EmptyStateDescription>{description}</EmptyStateDescription> : null}
        </Stack>
        {actions}
      </Stack>
    </div>
  );
}
