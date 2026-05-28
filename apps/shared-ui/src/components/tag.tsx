'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import { odsTransitionColors, odsTransitionOpacity } from '../lib/motion';
import { Flex } from './layout/flex';

export const tagVariants = cva(
  `inline-flex max-w-full min-w-0 items-center rounded-full border font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${odsTransitionColors}`,
  {
    variants: {
      variant: {
        neutral: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        success: 'border-transparent bg-success-muted text-success-muted-foreground hover:bg-success-muted/80',
        warning: 'border-transparent bg-warning-muted text-warning-muted-foreground hover:bg-warning-muted/80',
        error: 'border-transparent bg-destructive/15 text-destructive hover:bg-destructive/20',
        info: 'border-transparent bg-primary/10 text-primary hover:bg-primary/15',
        brand: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border-border bg-background text-foreground hover:bg-muted/50',
      },
      size: {
        sm: 'h-5 gap-1 px-2 text-xs',
        md: 'h-6 gap-1.5 px-3 text-xs',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'sm',
    },
  },
);

export type TagVariant = NonNullable<VariantProps<typeof tagVariants>['variant']>;

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {}

export function Tag({ className, variant, size, children, ...props }: TagProps) {
  return (
    <span className={cn(tagVariants({ variant, size }), className)} {...props}>
      {children}
    </span>
  );
}

export interface TagLabelProps extends React.HTMLAttributes<HTMLSpanElement> {}

/** Truncates long tag text without breaking layout. */
export function TagLabel({ className, ...props }: TagLabelProps) {
  return <span className={cn('min-w-0 truncate', className)} {...props} />;
}

export interface TagIconProps {
  className?: string;
  children: React.ReactNode;
}

/** Leading icon — 14px aligned to label. */
export function TagIcon({ className, children }: TagIconProps) {
  return (
    <span className={cn('inline-flex shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5', className)} aria-hidden>
      {children}
    </span>
  );
}

export interface TagCloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label'?: string;
}

/** Keyboard-accessible remove control for removable tags. */
export function TagCloseButton({
  className,
  'aria-label': ariaLabel = 'Remove tag',
  type = 'button',
  ...props
}: TagCloseButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        `inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-current opacity-70 hover:bg-foreground/10 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${odsTransitionOpacity}`,
        className,
      )}
      aria-label={ariaLabel}
      {...props}
    >
      <X className="h-3 w-3" aria-hidden />
    </button>
  );
}

export interface TagGroupProps extends React.ComponentProps<typeof Flex> {}

/** Horizontal tag list with wrap — use in filters, profiles, segment builders. */
export function TagGroup({ className, gap = 'sm', wrap = true, children, ...props }: TagGroupProps) {
  return (
    <Flex gap={gap} wrap={wrap} className={cn('min-w-0 max-w-full', className)} {...props}>
      {children}
    </Flex>
  );
}
