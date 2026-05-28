'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import * as React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { BarChart3 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  ChartAxisLabel,
  ChartContainer,
  ChartEmptyState,
  ChartHeader,
  ChartLegend,
  ChartLegendItem,
  ChartTooltip,
  ChartTrack,
  Flex,
  Grid,
  Stack,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  chartBarWidthClass,
  chartColumnHeightClass,
  chartHeatIntensityClass,
  chartRetentionHeatClass,
  chartSeriesColor,
  cn,
} from '@shared-ui';

// Re-export ODS chart primitives for admin panels
export {
  ChartAxisLabel,
  ChartContainer,
  ChartEmptyState,
  ChartHeader,
  ChartLegend,
  ChartLegendItem,
  ChartTrack,
  chartBarWidthClass,
  chartColumnHeightClass,
  chartHeatIntensityClass,
  chartRetentionHeatClass,
  chartSeriesColor,
  CHART_SERIES_COLORS,
} from '@shared-ui';

export type ChartGridProps = {
  children: React.ReactNode;
  columns?: 1 | 2;
  className?: string;
};

/** Responsive multi-chart layout (stacks on mobile). */
export function ChartGrid({ children, columns = 2, className }: ChartGridProps) {
  const colClass =
    columns === 2
      ? 'min-[1025px]:grid-cols-2'
      : 'grid-cols-1';
  return (
    <Grid cols={1} gap="md" className={cn(colClass, className)}>
      {children}
    </Grid>
  );
}

export type ChartCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

/** ODS Card wrapper for all admin charts. */
export function ChartCard({ title, description, children, className, contentClassName }: ChartCardProps) {
  const titleId = React.useId();
  const descriptionId = React.useId();

  return (
    <Card className={cn('border-border shadow-sm', className)}>
      <CardHeader className="space-y-0 pb-4">
        <ChartHeader
          title={title}
          description={description}
          titleId={titleId}
          descriptionId={description ? descriptionId : undefined}
        />
      </CardHeader>
      <CardContent className={cn('pt-0', contentClassName)}>
        <div role="group" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export type HorizontalBarChartItem = {
  label: string;
  value: number;
  displayValue?: string;
};

export type HorizontalBarChartProps = {
  title: string;
  description?: string;
  items: HorizontalBarChartItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  maxItems?: number;
  seriesIndex?: number;
  className?: string;
};

/** Horizontal bar list (analytics, categories, forecasts). */
export function HorizontalBarChart({
  title,
  description,
  items,
  emptyTitle = 'No chart data',
  emptyDescription = 'Adjust filters or date range to see metrics.',
  emptyIcon: EmptyIcon = BarChart3,
  maxItems = 12,
  seriesIndex = 0,
  className,
}: HorizontalBarChartProps) {
  const slice = items.slice(0, maxItems);
  const max = Math.max(...slice.map((i) => i.value), 1);
  const fillClass = chartSeriesColor(seriesIndex);

  return (
    <ChartCard title={title} description={description} className={className} contentClassName="pt-0">
      {slice.length === 0 ? (
        <ChartEmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={<EmptyIcon className="h-6 w-6" aria-hidden />}
        />
      ) : (
        <Stack gap="sm" className="list-none p-0">
          {slice.map((item) => {
            const ratio = item.value / max;
            return (
              <li key={item.label}>
                <Flex justify="between" align="center" className="mb-1 text-xs">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {item.displayValue ?? item.value.toLocaleString()}
                  </span>
                </Flex>
                <ChartTrack className="h-2">
                  <div
                    className={cn(
                      'h-full min-w-[4%] rounded-full transition-all',
                      fillClass,
                      chartBarWidthClass(Math.max(0.04, ratio)),
                    )}
                  />
                </ChartTrack>
              </li>
            );
          })}
        </Stack>
      )}
    </ChartCard>
  );
}

export type ColumnChartPoint = {
  label: string;
  value: number;
};

export type ColumnChartProps = {
  title?: string;
  description?: string;
  points: ColumnChartPoint[];
  emptyTitle?: string;
  emptyDescription?: string;
  maxPoints?: number;
  formatLabel?: (label: string) => string;
  className?: string;
  embedded?: boolean;
  minHeight?: 'sm' | 'md' | 'lg';
};

function ColumnChartBody({
  points,
  emptyTitle,
  emptyDescription,
  maxPoints,
  formatLabel,
  minHeight = 'md',
}: Pick<
  ColumnChartProps,
  'points' | 'emptyTitle' | 'emptyDescription' | 'maxPoints' | 'formatLabel' | 'minHeight'
>) {
  const slice = points.slice(-(maxPoints ?? 30));
  const max = Math.max(...slice.map((p) => p.value), 1);
  const labelFn = formatLabel ?? ((label: string) => label.slice(5));

  if (slice.length === 0) {
    return <ChartEmptyState title={emptyTitle ?? 'No trend data'} description={emptyDescription} />;
  }

  return (
    <ChartContainer minHeight={minHeight}>
      <Flex
        align="end"
        gap="xs"
        className={cn(
          'min-w-0 rounded-lg border border-border bg-muted/20 p-3',
          minHeight === 'sm' ? 'h-24' : 'h-48',
        )}
      >
        {slice.map((point) => (
          <Flex
            key={point.label}
            direction="col"
            align="center"
            justify="end"
            gap="xs"
            className="group relative min-w-6 flex-1"
          >
            <ChartTooltip label={point.label} value={point.value.toLocaleString()} />
            <div
              className={cn(
                'w-full rounded-t bg-primary transition-colors hover:bg-primary/90',
                chartColumnHeightClass(point.value / max),
              )}
            />
            <ChartAxisLabel className="max-w-16 truncate">{labelFn(point.label)}</ChartAxisLabel>
          </Flex>
        ))}
      </Flex>
    </ChartContainer>
  );
}

/** Vertical column chart (sales trend, demand, simulations). */
export function ColumnChart({
  title,
  description,
  points,
  emptyTitle = 'No trend data',
  emptyDescription = 'Try a wider date range or confirm sales activity.',
  maxPoints = 30,
  formatLabel,
  className,
  embedded = false,
  minHeight = 'md',
}: ColumnChartProps) {
  const body = (
    <ColumnChartBody
      points={points}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      maxPoints={maxPoints}
      formatLabel={formatLabel}
      minHeight={minHeight}
    />
  );

  if (embedded) return <div className={className}>{body}</div>;
  if (!title) return <div className={className}>{body}</div>;

  return (
    <ChartCard title={title} description={description} className={className}>
      {body}
    </ChartCard>
  );
}

export type DonutSummaryItem = {
  label: string;
  value: number;
};

export type DonutSummaryChartProps = {
  title: string;
  description?: string;
  items: DonutSummaryItem[];
  centerLabel?: string;
  centerCaption?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

/** Share breakdown with center total (payment methods, channels). */
export function DonutSummaryChart({
  title,
  description,
  items,
  centerLabel,
  centerCaption = 'total',
  emptyTitle = 'No breakdown data',
  emptyDescription = 'Segment data appears when transactions are recorded.',
  className,
}: DonutSummaryChartProps) {
  const total = items.reduce((sum, row) => sum + row.value, 0);
  const displayTotal = centerLabel ?? total.toLocaleString();

  return (
    <ChartCard title={title} description={description} className={className}>
      {items.length === 0 ? (
        <ChartEmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <Stack gap="md">
          <div className="grid place-items-center rounded-full border border-border bg-muted/20 p-8 text-center">
            <p className="text-2xl font-semibold tabular-nums text-foreground">{displayTotal}</p>
            <p className="text-xs text-muted-foreground">{centerCaption}</p>
          </div>
          <Stack gap="sm">
            {items.map((row, index) => {
              const share = total ? Math.round((row.value / total) * 100) : 0;
              return (
                <Flex key={row.label} justify="between" align="center" className="text-sm">
                  <Flex gap="sm" align="center">
                    <span
                      className={cn('h-2 w-2 shrink-0 rounded-full', chartSeriesColor(index))}
                      aria-hidden
                    />
                    <span className="text-foreground">{row.label}</span>
                  </Flex>
                  <Tag variant="neutral"><TagLabel>{share}%</TagLabel></Tag>
                </Flex>
              );
            })}
          </Stack>
          <ChartLegend>
            {items.slice(0, 4).map((row, index) => (
              <ChartLegendItem key={row.label} label={row.label} colorClass={chartSeriesColor(index)} />
            ))}
          </ChartLegend>
        </Stack>
      )}
    </ChartCard>
  );
}

export type HeatmapCell = {
  key: string;
  label: React.ReactNode;
  value: number;
  caption?: React.ReactNode;
};

export type HeatmapChartProps = {
  title: string;
  description?: string;
  cells: HeatmapCell[];
  emptyTitle?: string;
  emptyDescription?: string;
  columnsClassName?: string;
  className?: string;
};

/** Intensity grid (hourly sales, demand heatmaps). */
export function HeatmapChart({
  title,
  description,
  cells,
  emptyTitle = 'No heatmap data',
  emptyDescription = 'Activity patterns appear when hourly data is available.',
  columnsClassName = 'grid-cols-6 md:grid-cols-8 lg:grid-cols-12',
  className,
}: HeatmapChartProps) {
  const max = Math.max(...cells.map((c) => c.value), 1);

  return (
    <ChartCard title={title} description={description} className={className}>
      {cells.length === 0 ? (
        <ChartEmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <ChartContainer minHeight="sm">
          <div className={cn('grid gap-2', columnsClassName)}>
            {cells.map((cell) => (
              <div
                key={cell.key}
                className={cn(
                  'rounded-md p-2 text-center text-xs',
                  chartHeatIntensityClass(cell.value / max),
                )}
              >
                <p className="font-medium">{cell.label}</p>
                {cell.caption ? <p className="tabular-nums">{cell.caption}</p> : null}
              </div>
            ))}
          </div>
        </ChartContainer>
      )}
    </ChartCard>
  );
}

export type LineChartSeries = {
  values: number[];
  strokeClass?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
};

export type LineChartProps = {
  title?: string;
  description?: string;
  series: LineChartSeries[];
  pointCount?: number;
  ariaLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  embedded?: boolean;
};

/** SVG line chart with optional confidence bands (forecasting). */
export function LineChart({
  title,
  description,
  series,
  pointCount = 14,
  ariaLabel = 'Trend line chart',
  emptyTitle = 'No trend data',
  emptyDescription = 'Forecast points appear once demand history is available.',
  className,
  embedded = false,
}: LineChartProps) {
  const primary = series[0];
  const values = primary?.values.slice(0, pointCount) ?? [];
  const max = Math.max(1, ...values, ...series.flatMap((s) => s.values.slice(0, pointCount)));

  const toPoints = (vals: number[]) =>
    vals
      .map((value, index) => {
        const x = 10 + index * 24;
        const y = 110 - (value / max) * 90;
        return `${x},${y}`;
      })
      .join(' ');

  const body =
    values.length === 0 ? (
      <ChartEmptyState title={emptyTitle} description={emptyDescription} />
    ) : (
      <ChartContainer minHeight="lg">
        <svg
          className="h-56 w-full max-w-full text-primary"
          viewBox="0 0 340 120"
          role="img"
          aria-label={ariaLabel}
        >
          {series.map((s, index) => (
            <polyline
              key={index}
              points={toPoints(s.values.slice(0, pointCount))}
              fill="none"
              stroke="currentColor"
              strokeWidth={s.strokeWidth ?? (index === 0 ? 3 : 2)}
              strokeOpacity={s.strokeOpacity ?? (index === 0 ? 1 : 0.25)}
              className={s.strokeClass}
            />
          ))}
          {values.map((value, index) => (
            <circle
              key={index}
              cx={10 + index * 24}
              cy={110 - (value / max) * 90}
              r="3"
              fill="currentColor"
              className="text-primary"
            />
          ))}
        </svg>
      </ChartContainer>
    );

  if (embedded) return <div className={className}>{body}</div>;

  if (!title) return <div className={className}>{body}</div>;

  return (
    <ChartCard title={title} description={description} className={className}>
      {body}
    </ChartCard>
  );
}

export type BarListItem = { label: string; value: number };

export type AffinityEdge = {
  key: string;
  sourceLabel: string;
  targetLabel: string;
  weight: number;
};

export type AffinityNetworkChartProps = {
  title: string;
  description?: string;
  edges: AffinityEdge[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

/** Product affinity edge grid (analytics insights). */
export function AffinityNetworkChart({
  title,
  description,
  edges,
  emptyTitle = 'No affinity pairs',
  emptyDescription = 'Basket analysis surfaces product pairs after sufficient order volume.',
  className,
}: AffinityNetworkChartProps) {
  return (
    <ChartCard title={title} description={description} className={className}>
      {edges.length === 0 ? (
        <ChartEmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <ChartContainer minHeight="sm">
          <Grid cols={1} gap="sm" className="min-[481px]:grid-cols-2">
            {edges.map((edge) => (
              <div key={edge.key} className="rounded-md border border-border p-3 text-sm">
                <p className="font-medium text-foreground">{edge.sourceLabel}</p>
                <p className="text-muted-foreground">pairs with {edge.targetLabel}</p>
                <p className="text-xs text-primary">Affinity {edge.weight.toFixed(1)}</p>
              </div>
            ))}
          </Grid>
        </ChartContainer>
      )}
    </ChartCard>
  );
}

export type CohortRetentionRow = {
  cohort: string;
  cohortHref: string;
  months: Array<{ month: string; retentionRate: number }>;
};

export type CohortRetentionHeatmapProps = {
  title: string;
  description?: string;
  rows: CohortRetentionRow[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

/** Cohort retention grid with ODS heat intensity tokens. */
export function CohortRetentionHeatmap({
  title,
  description,
  rows,
  emptyTitle = 'No cohort data',
  emptyDescription = 'Retention heatmaps populate after cohort snapshots are computed.',
  className,
}: CohortRetentionHeatmapProps) {
  return (
    <ChartCard title={title} description={description} className={className}>
      {rows.length === 0 ? (
        <ChartEmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <ChartContainer minHeight="sm">
          <Stack gap="sm">
            {rows.map((row) => (
              <Flex key={row.cohort} wrap align="center" gap="sm">
                <Link
                  href={row.cohortHref}
                  className="w-20 shrink-0 text-sm font-medium text-primary hover:underline"
                >
                  {row.cohort}
                </Link>
                {row.months.map((month) => (
                  <div
                    key={`${row.cohort}-${month.month}`}
                    className={cn(
                      'h-9 w-16 rounded-md border border-border text-center text-xs leading-9 tabular-nums',
                      chartRetentionHeatClass(month.retentionRate),
                    )}
                  >
                    {month.retentionRate.toFixed(0)}%
                  </div>
                ))}
              </Flex>
            ))}
          </Stack>
        </ChartContainer>
      )}
    </ChartCard>
  );
}

export type ClusterBubblePoint = {
  customerId: string;
  customerHref: string;
  customerName: string;
  size: number;
};

export type ClusterBubbleChartProps = {
  title: string;
  description?: string;
  points: ClusterBubblePoint[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

function clusterBubbleSizeClass(size: number): string {
  if (size >= 24) return 'h-7 w-7';
  if (size >= 18) return 'h-6 w-6';
  if (size >= 12) return 'h-5 w-5';
  return 'h-4 w-4';
}

/** Segmentation cluster bubble grid (analytics insights). */
export function ClusterBubbleChart({
  title,
  description = 'More recent customers on the left · larger bubbles indicate higher frequency',
  points,
  emptyTitle = 'No cluster points',
  emptyDescription = 'Customer clusters render after segmentation runs.',
  className,
}: ClusterBubbleChartProps) {
  return (
    <ChartCard title={title} description={description} className={className}>
      {points.length === 0 ? (
        <ChartEmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <ChartContainer minHeight="md">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <Grid cols={5} gap="sm" className="md:grid-cols-8 xl:grid-cols-10">
              {points.map((point) => (
                <Tooltip key={point.customerId}>
                  <TooltipTrigger asChild>
                    <Link
                      href={point.customerHref}
                      className={cn(
                        'rounded-full bg-primary/70 transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        clusterBubbleSizeClass(point.size),
                      )}
                      aria-label={point.customerName}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">{point.customerName}</TooltipContent>
                </Tooltip>
              ))}
            </Grid>
          </div>
        </ChartContainer>
      )}
    </ChartCard>
  );
}

export type BarListChartProps = {
  title: string;
  description?: string;
  items: BarListItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

/** Compact bar list (churn funnel, LTV distribution). */
export function BarListChart({
  title,
  description,
  items,
  emptyTitle = 'No distribution data',
  emptyDescription = 'Counts appear after insight snapshots are generated.',
  className,
}: BarListChartProps) {
  const max = Math.max(1, ...items.map((row) => row.value));

  return (
    <ChartCard title={title} description={description} className={className}>
      {items.length === 0 ? (
        <ChartEmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <Stack gap="sm">
          {items.map((row) => (
            <div key={row.label}>
              <Flex justify="between" className="mb-1 text-sm">
                <span className="text-foreground">{row.label}</span>
                <span className="tabular-nums text-muted-foreground">{row.value}</span>
              </Flex>
              <ChartTrack className="h-2">
                <div
                  className={cn('h-2 rounded-full bg-primary', chartBarWidthClass(row.value / max))}
                />
              </ChartTrack>
            </div>
          ))}
        </Stack>
      )}
    </ChartCard>
  );
}
