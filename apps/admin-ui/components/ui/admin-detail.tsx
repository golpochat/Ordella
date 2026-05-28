import * as React from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Grid,
  PageSection,
  Stack,
} from '@shared-ui';
import { StatusTag, Tag, TagLabel, inferStatusTagVariant, type TagProps } from '@/components/ui/admin-tag';
import { cn } from '@shared-ui';
import { MetricCard, MetricGrid } from '@/components/ui/admin-card';
import { PageHeader } from '@/components/ui/admin-page-header';
import { DetailPageHeader } from '@/components/ui/admin-breadcrumb';

export {
  Tag,
  TagLabel,
  StatusTag,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Grid,
  DetailPageHeader,
  PageHeader,
  PageSection,
  Stack,
};
export { AdminBreadcrumb, Breadcrumb, type BreadcrumbItemData } from '@/components/ui/admin-breadcrumb';

export type DetailPageProps = {
  children: React.ReactNode;
  className?: string;
};

/** Standard vertical rhythm for admin detail routes (inside shell ContentArea). */
export function DetailPage({ children, className }: DetailPageProps) {
  return <div className={cn('min-w-0 w-full', className)}>{children}</div>;
}

export type DetailFieldProps = {
  label: string;
  value: React.ReactNode;
  className?: string;
};

/** Label + value tile for metadata grids. */
export function DetailField({ label, value, className }: DetailFieldProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-4 shadow-sm', className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 break-words text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

export type DetailMetricProps = {
  label: string;
  value: React.ReactNode;
  className?: string;
};

/** KPI-style metric card for detail headers. */
export function DetailMetric({ label, value, className }: DetailMetricProps) {
  return <MetricCard label={label} value={value} className={className} />;
}

export type DetailMetricsProps = {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
};

export function DetailMetrics({ children, columns = 4, className }: DetailMetricsProps) {
  return (
    <MetricGrid columns={columns} className={className}>
      {children}
    </MetricGrid>
  );
}

export type DetailTwoColumnProps = {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  className?: string;
};

/** Desktop: primary left, secondary right; stacks on mobile/tablet. */
export function DetailTwoColumn({ primary, secondary, className }: DetailTwoColumnProps) {
  return (
    <Grid cols={1} gap="lg" className={cn('min-[769px]:grid-cols-2', className)}>
      <Stack gap="lg" className="min-w-0">
        {primary}
      </Stack>
      {secondary ? (
        <Stack gap="lg" className="min-w-0">
          {secondary}
        </Stack>
      ) : null}
    </Grid>
  );
}

export type DetailSectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

/** PageSection + Card grouping for detail blocks. */
export function DetailSectionCard({ title, description, children }: DetailSectionCardProps) {
  return (
    <PageSection title={title} description={description} className="mb-0 min-[769px]:mb-0">
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">{children}</CardContent>
      </Card>
    </PageSection>
  );
}

export type DetailStatusBadgeProps = Omit<TagProps, 'variant' | 'children'> & {
  status: string;
};

/** Map common status strings to semantic ODS tag variants. */
export function DetailStatusBadge({ status, ...props }: DetailStatusBadgeProps) {
  return (
    <StatusTag label={status} variant={inferStatusTagVariant(status)} {...props} />
  );
}

/**
 * @deprecated Use `DetailPageHeader` with `breadcrumb` items instead of header actions.
 */
export function DetailBackLink({ href, label = 'Back' }: { href: string; label?: string }) {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={href}>{label}</Link>
    </Button>
  );
}
