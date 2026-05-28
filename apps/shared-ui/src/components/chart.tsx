import * as React from 'react';
import { cn } from '../lib/utils';
import { Flex } from './layout/flex';
import { Stack } from './layout/stack';
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  type EmptyStateProps,
} from './empty-state';

/** ODS data-series colors (primary → accent → secondary). */
export const CHART_SERIES_COLORS = [
  'bg-primary',
  'bg-accent',
  'bg-secondary',
  'bg-primary/70',
  'bg-accent/70',
] as const;

export function chartSeriesColor(index: number): (typeof CHART_SERIES_COLORS)[number] {
  return CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length];
}

export function chartBarWidthClass(ratio: number): string {
  const pct = Math.max(0, Math.min(1, ratio));
  if (pct >= 0.9) return 'w-full';
  if (pct >= 0.75) return 'w-10/12';
  if (pct >= 0.5) return 'w-8/12';
  if (pct >= 0.25) return 'w-5/12';
  if (pct > 0) return 'w-2/12';
  return 'w-0';
}

export function chartColumnHeightClass(ratio: number): string {
  const pct = Math.max(0, Math.min(1, ratio));
  if (pct >= 0.9) return 'h-44';
  if (pct >= 0.75) return 'h-36';
  if (pct >= 0.5) return 'h-28';
  if (pct >= 0.25) return 'h-16';
  if (pct > 0) return 'h-8';
  return 'h-1';
}

export function chartHeatIntensityClass(ratio: number): string {
  const pct = Math.max(0, Math.min(1, ratio));
  if (pct >= 0.75) return 'bg-primary text-primary-foreground';
  if (pct >= 0.5) return 'bg-primary/70 text-primary-foreground';
  if (pct >= 0.25) return 'bg-primary/30 text-foreground';
  if (pct > 0) return 'bg-muted text-foreground';
  return 'bg-muted/40 text-muted-foreground';
}

export function chartRetentionHeatClass(rate: number): string {
  if (rate >= 80) return 'bg-primary text-primary-foreground';
  if (rate >= 60) return 'bg-primary/70 text-primary-foreground';
  if (rate >= 40) return 'bg-primary/40 text-primary-foreground';
  if (rate >= 20) return 'bg-primary/20 text-foreground';
  return 'bg-muted text-muted-foreground';
}

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  minHeight?: 'sm' | 'md' | 'lg';
  /** Accessible name for the chart figure. */
  ariaLabel?: string;
  /** id of element that labels this chart (e.g. ChartHeader title). */
  labelledBy?: string;
  /** id of element that describes this chart. */
  describedBy?: string;
}

/** Responsive chart plot area; prevents overflow outside Card. */
export function ChartContainer({
  children,
  className,
  minHeight = 'md',
  ariaLabel,
  labelledBy,
  describedBy,
  ...props
}: ChartContainerProps) {
  const minHeights = {
    sm: 'min-h-32',
    md: 'min-h-48',
    lg: 'min-h-56',
  };

  return (
    <div
      role="figure"
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={cn('w-full max-w-full overflow-x-auto overflow-y-hidden', minHeights[minHeight], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ChartHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  titleId?: string;
  descriptionId?: string;
}

export function ChartHeader({
  title,
  description,
  action,
  className,
  titleId,
  descriptionId,
}: ChartHeaderProps) {
  return (
    <Flex justify="between" align="start" gap="md" className={cn('gap-4', className)}>
      <Stack gap="xs" className="min-w-0 flex-1">
        <h3 id={titleId} className="text-base font-semibold leading-tight text-foreground">
          {title}
        </h3>
        {description ? (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </Stack>
      {action ? <div className="shrink-0">{action}</div> : null}
    </Flex>
  );
}

export interface ChartLegendProps {
  children: React.ReactNode;
  className?: string;
}

export function ChartLegend({ children, className }: ChartLegendProps) {
  return (
    <Flex gap="md" wrap align="center" className={cn('mt-4 text-xs text-muted-foreground', className)}>
      {children}
    </Flex>
  );
}

export interface ChartLegendItemProps {
  label: string;
  colorClass?: string;
  className?: string;
}

export function ChartLegendItem({
  label,
  colorClass = 'bg-primary',
  className,
}: ChartLegendItemProps) {
  return (
    <Flex gap="xs" align="center" className={cn('text-xs text-muted-foreground', className)}>
      <span className={cn('h-2 w-2 shrink-0 rounded-full', colorClass)} aria-hidden />
      <span>{label}</span>
    </Flex>
  );
}

export interface ChartTooltipProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

/** Accessible hover tooltip for chart segments (use with group/group-hover). */
export function ChartTooltip({ label, value, className }: ChartTooltipProps) {
  return (
    <div
      role="tooltip"
      className={cn(
        'pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 max-w-xs -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-card-foreground shadow-md opacity-0 transition-opacity duration-fast ease-default group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none',
        className,
      )}
    >
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-muted-foreground"> · </span>
      <span>{value}</span>
    </div>
  );
}

export interface ChartEmptyStateProps extends Pick<EmptyStateProps, 'title' | 'description' | 'icon'> {
  className?: string;
}

export function ChartEmptyState({ title, description, icon, className }: ChartEmptyStateProps) {
  return (
    <EmptyState title={title} size="compact" className={cn('border-0 bg-transparent shadow-none', className)}>
      {icon ? <EmptyStateIcon>{icon}</EmptyStateIcon> : null}
      <EmptyStateTitle>{title}</EmptyStateTitle>
      {description ? <EmptyStateDescription>{description}</EmptyStateDescription> : null}
    </EmptyState>
  );
}

/** Axis / tick label typography. */
export function ChartAxisLabel({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('text-[10px] leading-none text-muted-foreground', className)} {...props}>
      {children}
    </span>
  );
}

/** Track behind bar/column fills. */
export function ChartTrack({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('overflow-hidden rounded-full bg-muted', className)}
      {...props}
    />
  );
}
