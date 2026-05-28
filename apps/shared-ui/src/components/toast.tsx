'use client';

import * as React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { odsToastEnter } from '../lib/motion';
import { Flex } from './layout/flex';
import { Stack } from './layout/stack';
import { IconButton } from './icon-button';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-l-success bg-success-muted text-success-muted-foreground',
  error: 'border-l-destructive bg-destructive/10 text-foreground',
  warning: 'border-l-warning bg-warning-muted text-warning-muted-foreground',
  info: 'border-l-info bg-info-muted text-info-muted-foreground',
};

const VARIANT_ICONS: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export const TOAST_DURATIONS: Record<ToastVariant, number | null> = {
  success: 5000,
  info: 5000,
  warning: 7000,
  error: null,
};

export interface ToastIconProps {
  variant: ToastVariant;
  className?: string;
}

export function ToastIcon({ variant, className }: ToastIconProps) {
  const Icon = VARIANT_ICONS[variant];
  return (
    <Icon
      className={cn(
        'h-4 w-4 shrink-0',
        variant === 'success' && 'text-success',
        variant === 'error' && 'text-destructive',
        variant === 'warning' && 'text-warning',
        variant === 'info' && 'text-info',
        className,
      )}
      aria-hidden
    />
  );
}

export interface ToastTitleProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function ToastTitle({ className, ...props }: ToastTitleProps) {
  return <p className={cn('text-sm font-semibold leading-none', className)} {...props} />;
}

export interface ToastDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  return <p className={cn('text-sm leading-snug text-muted-foreground', className)} {...props} />;
}

export interface ToastCloseButtonProps {
  onClick: () => void;
  className?: string;
  'aria-label'?: string;
}

export function ToastCloseButton({
  onClick,
  className,
  'aria-label': ariaLabel = 'Dismiss notification',
}: ToastCloseButtonProps) {
  return (
    <IconButton
      type="button"
      size="sm"
      variant="ghost"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn('shrink-0', className)}
    >
      <X className="h-4 w-4" aria-hidden />
    </IconButton>
  );
}

export interface ToastProps {
  id: string;
  variant: ToastVariant;
  title?: string;
  description: string;
  onDismiss: (id: string) => void;
  duration?: number | null;
  className?: string;
}

/** Single ODS toast — padding, radius, shadow, semantic border accent. */
export function Toast({ id, variant, title, description, onDismiss, duration, className }: ToastProps) {
  const [paused, setPaused] = React.useState(false);
  const resolvedDuration = duration === undefined ? TOAST_DURATIONS[variant] : duration;
  const autoDismiss = resolvedDuration !== null && resolvedDuration > 0;

  React.useEffect(() => {
    if (!autoDismiss || paused) return;
    const timer = window.setTimeout(() => onDismiss(id), resolvedDuration!);
    return () => window.clearTimeout(timer);
  }, [autoDismiss, paused, id, onDismiss, resolvedDuration]);

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={cn(
        'pointer-events-auto w-full min-w-[280px] max-w-[420px] rounded-md border border-border border-l-4 p-4 shadow-md',
        odsToastEnter,
        VARIANT_STYLES[variant],
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Flex gap="sm" align="start" className="w-full">
        <ToastIcon variant={variant} className="mt-0.5" />
        <Stack gap="xs" className="min-w-0 flex-1">
          {title ? <ToastTitle>{title}</ToastTitle> : null}
          <ToastDescription className={title ? undefined : 'text-foreground'}>{description}</ToastDescription>
        </Stack>
        <ToastCloseButton onClick={() => onDismiss(id)} />
      </Flex>
    </div>
  );
}

export interface ToastContainerProps {
  toasts: Array<{
    id: string;
    variant: ToastVariant;
    title?: string;
    description: string;
    duration?: number | null;
  }>;
  onDismiss: (id: string) => void;
  className?: string;
}

/** Global toast stack — top-right desktop, full-width bottom mobile. */
export function ToastContainer({ toasts, onDismiss, className }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className={cn(
        'pointer-events-none fixed z-[500] flex max-h-[100dvh] flex-col gap-2 overflow-hidden p-4',
        'max-[480px]:inset-x-0 max-[480px]:bottom-0 max-[480px]:top-auto max-[480px]:max-w-none',
        'min-[481px]:right-0 min-[481px]:top-0 min-[481px]:w-full min-[481px]:max-w-[min(420px,calc(100vw-2rem))]',
        className,
      )}
    >
      {toasts.map((item) => (
        <Toast key={item.id} {...item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
