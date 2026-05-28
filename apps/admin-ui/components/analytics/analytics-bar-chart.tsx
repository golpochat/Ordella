import { HorizontalBarChartLazy as HorizontalBarChart } from '@/lib/lazy-charts';

type BarChartItem = {
  label: string;
  value: number;
  displayValue?: string;
};

type AnalyticsBarChartProps = {
  title: string;
  items: BarChartItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  /** @deprecated Use emptyTitle */
  emptyMessage?: string;
};

export function AnalyticsBarChart({
  title,
  items,
  emptyTitle,
  emptyDescription = 'Metrics will appear for the selected date range.',
  emptyMessage,
}: AnalyticsBarChartProps) {
  return (
    <HorizontalBarChart
      title={title}
      items={items}
      emptyTitle={emptyTitle ?? emptyMessage ?? 'No chart data'}
      emptyDescription={emptyDescription}
    />
  );
}
