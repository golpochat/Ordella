import { Card, CardBody, Icon, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
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
        <Icon name="check" size="sm" decorative />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center text-slate/60" aria-label="Not included">
        <Icon name="minus" size="sm" decorative />
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
        <Card
          key={row.label}
          className="border-border/80 shadow-sm"
          data-ods-elevation="sm"
        >
          <CardBody className="p-4">
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
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export function ComparisonTable({ planIds, rows, className }: ComparisonTableProps) {
  return (
    <div className={className}>
      <MobileComparison planIds={planIds} rows={rows} />

      <div className="hidden md:block">
        <Table aria-label="Plan comparison">
          <TableCaption className="sr-only">Plan comparison</TableCaption>
          <TableHeader className="bg-gray-light">
            <TableRow>
              <TableHead className="py-4 pl-5 pr-4 text-left text-sm font-semibold text-navy sm:pl-6">
                Feature
              </TableHead>
              {planIds.map((id) => (
                <TableHead key={id} className="px-4 py-4 text-center text-sm font-semibold text-navy">
                  {planLabels[id]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={row.label} className={cn(i % 2 === 1 && 'bg-gray-light/60')}>
                <TableHead
                  scope="row"
                  className="py-3.5 pl-5 pr-4 text-left font-normal text-slate sm:pl-6"
                >
                  {row.label}
                </TableHead>
                {planIds.map((id) => (
                  <TableCell key={id} className="px-4 py-3.5 text-center">
                    <CellContent value={row.values[id]} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
