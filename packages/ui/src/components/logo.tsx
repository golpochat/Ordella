import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';
import { LogoMarkSvg } from './logo-mark-svg';

export type LogoVariant = 'full' | 'mark';
export type LogoSize = 'sm' | 'md' | 'lg';
/** `light` = dark ink on light backgrounds; `dark` = light ink on dark backgrounds */
export type LogoColor = 'auto' | 'light' | 'dark';

export type LogoProps = HTMLAttributes<HTMLDivElement> & {
  variant?: LogoVariant;
  size?: LogoSize;
  color?: LogoColor;
  /** Accessible label; defaults to "Ordella" */
  label?: string;
};

const sizeClasses: Record<LogoSize, { mark: string; word: string }> = {
  sm: { mark: 'h-6 w-6', word: 'text-base' },
  md: { mark: 'h-8 w-8', word: 'text-lg' },
  lg: { mark: 'h-10 w-10', word: 'text-xl' },
};

const wordToneClasses = {
  light: 'text-slate-900',
  dark: 'text-slate-50',
} as const;

function Wordmark({ tone, className }: { tone: 'light' | 'dark'; className?: string }) {
  return (
    <span className={cn('font-bold tracking-tight', wordToneClasses[tone], className)} aria-hidden>
      Ordella
    </span>
  );
}

function LogoMark({ tone, size }: { tone: 'light' | 'dark'; size: LogoSize }) {
  return <LogoMarkSvg tone={tone} className={sizeClasses[size].mark} />;
}

function LogoContent({
  variant,
  size,
  tone,
}: {
  variant: LogoVariant;
  size: LogoSize;
  tone: 'light' | 'dark';
}) {
  if (variant === 'mark') {
    return <LogoMark tone={tone} size={size} />;
  }

  return (
    <>
      <LogoMark tone={tone} size={size} />
      <Wordmark tone={tone} className={sizeClasses[size].word} />
    </>
  );
}

export function Logo({
  variant = 'full',
  size = 'md',
  color = 'auto',
  label = 'Ordella',
  className,
  ...props
}: LogoProps) {
  const layoutClass =
    variant === 'full' ? 'inline-flex items-center gap-2.5' : 'inline-flex items-center';

  if (color === 'auto') {
    return (
      <div
        role="img"
        aria-label={label}
        className={cn(layoutClass, className)}
        {...props}
      >
        <span className={cn(layoutClass, 'dark:hidden')}>
          <LogoContent variant={variant} size={size} tone="light" />
        </span>
        <span className={cn(layoutClass, 'hidden dark:inline-flex')}>
          <LogoContent variant={variant} size={size} tone="dark" />
        </span>
      </div>
    );
  }

  const tone = color === 'dark' ? 'dark' : 'light';

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(layoutClass, className)}
      {...props}
    >
      <LogoContent variant={variant} size={size} tone={tone} />
    </div>
  );
}
