type BarChartItem = {
  label: string;
  value: number;
  displayValue?: string;
};

type AnalyticsBarChartProps = {
  title: string;
  items: BarChartItem[];
  emptyMessage?: string;
};

export function AnalyticsBarChart({
  title,
  items,
  emptyMessage = 'No data for this period.',
}: AnalyticsBarChartProps) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">
                  {item.displayValue ?? item.value.toLocaleString()}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
