import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { PlanId } from '@/lib/plans';

type ComparisonRow = {
  label: string;
  values: Record<PlanId, string | boolean>;
};

type ComparisonTableProps = {
  planIds: PlanId[];
  rows: ComparisonRow[];
  className?: string;
};

function CellContent({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center text-primary" aria-label="Included">
        <Check className="h-4 w-4" aria-hidden />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center text-slate/60" aria-label="Not included">
        <Minus className="h-4 w-4" aria-hidden />
      </span>
    );
  }
  return <span className="text-sm font-medium text-navy">{value}</span>;
}

const planLabels: Record<PlanId, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

function MobileComparison({
  planIds,
  rows,
}: {
  planIds: PlanId[];
  rows: ComparisonRow[];
}) {
  return (
    <div className="space-y-4 md:hidden">
      {rows.map((row) => (
        <article
          key={row.label}
          className="rounded-xl border border-border/80 bg-card p-4 shadow-brand"
        >
          <h3 className="text-sm font-semibold text-navy">{row.label}</h3>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            {planIds.map((id) => (
              <div key={id} className="flex flex-col gap-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate">
                  {planLabels[id]}
                </dt>
                <dd className="flex items-center">
                  <CellContent value={row.values[id]} />
                </dd>
              </div>
            ))}
          </dl>
        </article>
      ))}
    </div>
  );
}

export function ComparisonTable({ planIds, rows, className }: ComparisonTableProps) {
  return (
    <div className={className}>
      <MobileComparison planIds={planIds} rows={rows} />

      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-brand md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <caption className="sr-only">Plan comparison</caption>
            <thead>
              <tr className="border-b border-border bg-gray-light">
                <th
                  scope="col"
                  className="py-4 pl-5 pr-4 text-left text-sm font-semibold text-navy sm:pl-6"
                >
                  Feature
                </th>
                {planIds.map((id) => (
                  <th
                    key={id}
                    scope="col"
                    className="px-4 py-4 text-center text-sm font-semibold text-navy"
                  >
                    {planLabels[id]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.label}
                  className={cn('border-b border-border/60', i % 2 === 1 && 'bg-gray-light/60')}
                >
                  <th
                    scope="row"
                    className="py-3.5 pl-5 pr-4 text-left font-normal text-slate sm:pl-6"
                  >
                    {row.label}
                  </th>
                  {planIds.map((id) => (
                    <td key={id} className="px-4 py-3.5 text-center">
                      <CellContent value={row.values[id]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
