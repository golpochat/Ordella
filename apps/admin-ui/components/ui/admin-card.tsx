import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Flex,
  Grid,
  Stack,
} from '@shared-ui';
import { cn } from '@shared-ui';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Grid,
  Stack,
};

/** ODS alias — same as CardContent. */
export const CardBody = CardContent;

export type MetricCardProps = {
  label?: string;
  /** Alias for `label` (legacy metric tiles). */
  title?: string;
  value: React.ReactNode;
  description?: string;
  /** Alias for `description`. */
  detail?: string;
  className?: string;
  size?: 'default' | 'compact';
};

/** KPI / analytics metric tile on the 8px grid. */
export function MetricCard({
  label,
  title,
  value,
  description,
  detail,
  className,
  size = 'default',
}: MetricCardProps) {
  const heading = label ?? title ?? '';
  const sub = description ?? detail;

  return (
    <Card className={cn('border-border shadow-sm', className)}>
      <CardBody className="p-4">
        <Stack gap="xs">
          <p className="text-xs text-muted-foreground">{heading}</p>
          <p
            className={cn(
              'font-semibold tabular-nums text-foreground',
              size === 'compact' ? 'text-lg' : 'text-2xl',
            )}
          >
            {value}
          </p>
          {sub ? <p className="text-sm text-muted-foreground">{sub}</p> : null}
        </Stack>
      </CardBody>
    </Card>
  );
}

/** Legacy name — supports `title` or `label`. */
export function Metric(props: MetricCardProps) {
  return <MetricCard {...props} />;
}

export type MetricGridProps = {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
};

const metricGridCols: Record<NonNullable<MetricGridProps['columns']>, string> = {
  2: 'min-[769px]:grid-cols-2',
  3: 'min-[481px]:grid-cols-2 min-[769px]:grid-cols-3',
  4: 'min-[481px]:grid-cols-2 min-[769px]:grid-cols-4',
  5: 'min-[481px]:grid-cols-2 min-[769px]:grid-cols-3 min-[1025px]:grid-cols-5',
  6: 'min-[481px]:grid-cols-2 min-[769px]:grid-cols-3 min-[1025px]:grid-cols-6',
};

/** Responsive grid for dashboard metric cards. */
export function MetricGrid({ children, columns = 4, className }: MetricGridProps) {
  return (
    <Grid cols={1} gap="md" className={cn(metricGridCols[columns], className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<{ className?: string }>, {
          className: cn((child.props as { className?: string }).className, 'ods-stagger-item'),
        });
      })}
    </Grid>
  );
}

export type SectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

/** Standard content card with header (charts, tables, forms). */
export function SectionCard({
  title,
  description,
  children,
  footer,
  actions,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card className={cn('border-border shadow-sm', className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="min-w-0">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {actions ? <Flex gap="sm" wrap className="shrink-0">{actions}</Flex> : null}
      </CardHeader>
      <CardBody className={cn('pt-0', contentClassName)}>{children}</CardBody>
      {footer ? <CardFooter className="justify-end gap-2 border-t border-border">{footer}</CardFooter> : null}
    </Card>
  );
}

export type InteractiveCardProps = React.ComponentProps<typeof Card> & {
  href?: string;
};

/** Clickable card with ODS hover/active affordance. */
export function InteractiveCard({ className, href, children, ...props }: InteractiveCardProps) {
  const cardClass = cn(
    'border-border shadow-sm transition-[border-color,background-color,box-shadow] duration-fast ease-default motion-reduce:transition-none',
    href &&
      'cursor-pointer hover:border-primary/40 hover:bg-accent/30 hover:shadow-md active:scale-[0.99] motion-reduce:active:scale-100',
    className,
  );

  if (href) {
    return (
      <Card className={cardClass} {...props}>
        <Link href={href} className="block min-w-0 no-underline text-inherit">
          {children}
        </Link>
      </Card>
    );
  }

  return (
    <Card className={cardClass} {...props}>
      {children}
    </Card>
  );
}

/** Inline stat tile (nested inside a parent card). */
export function StatTile({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border border-border bg-muted/30 p-4', className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
