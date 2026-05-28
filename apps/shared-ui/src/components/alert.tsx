'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Flex } from './layout/flex';

const alertVariants = cva('relative w-full rounded-md border px-4 py-3 text-sm shadow-sm', {
  variants: {
    variant: {
      error: 'border-destructive/40 bg-destructive/10 text-foreground',
      success: 'border-success/40 bg-success-muted text-success-muted-foreground',
      warning: 'border-warning/40 bg-warning-muted text-warning-muted-foreground',
      info: 'border-info/40 bg-info-muted text-info-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

const iconMap = {
  error: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
} as const;

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant = 'info', children, ...props }: AlertProps) {
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export interface AlertIconProps {
  variant?: NonNullable<AlertProps['variant']>;
  className?: string;
}

export function AlertIcon({ variant = 'info', className }: AlertIconProps) {
  const Icon = iconMap[variant ?? 'info'];
  return (
    <Icon
      className={cn(
        'h-4 w-4 shrink-0',
        variant === 'error' && 'text-destructive',
        variant === 'success' && 'text-success',
        variant === 'warning' && 'text-warning',
        variant === 'info' && 'text-info',
        className,
      )}
      aria-hidden
    />
  );
}

export interface AlertTitleProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function AlertTitle({ className, ...props }: AlertTitleProps) {
  return <p className={cn('font-medium leading-none', className)} {...props} />;
}

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return <div className={cn('text-sm leading-snug text-muted-foreground [&_p]:leading-snug', className)} {...props} />;
}

export interface AlertContentProps {
  variant?: NonNullable<AlertProps['variant']>;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/** Icon + stacked title/description — common form-level feedback layout. */
export function AlertContent({ variant = 'info', title, children, className }: AlertContentProps) {
  return (
    <Flex gap="sm" align="start" className={className}>
      <AlertIcon variant={variant} />
      <div className="min-w-0 space-y-1">
        {title ? <AlertTitle>{title}</AlertTitle> : null}
        <AlertDescription className={title ? undefined : 'text-foreground'}>{children}</AlertDescription>
      </div>
    </Flex>
  );
}
