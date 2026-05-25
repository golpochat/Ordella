import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import { listAuditLogs } from '@/lib/api/admin/audit-logs';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { AuditLogsFilters } from '@/components/audit-logs/audit-logs-filters';
import { AuditLogsTable } from '@/components/audit-logs/audit-logs-table';
import { getErrorMessage } from '@/lib/utils';

type AuditLogsPageProps = {
  searchParams: {
    from?: string;
    to?: string;
    userId?: string;
    locationId?: string;
    entityType?: string;
    action?: string;
    page?: string;
    limit?: string;
  };
};

export default async function AuditLogsPage({ searchParams }: AuditLogsPageProps) {
  let result: Awaited<ReturnType<typeof listAuditLogs>> = {
    logs: [],
    page: 1,
    limit: 50,
    total: 0,
  };
  let error: string | null = null;

  try {
    result = await listAuditLogs(createServerApiClient(), {
      ...searchParams,
      page: searchParams.page ? Number(searchParams.page) : undefined,
      limit: searchParams.limit ? Number(searchParams.limit) : undefined,
    });
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <>
      <PageHeader
        title="Audit Logs"
        description="Business logs for security, compliance, and operational review"
      />
      <Suspense fallback={null}>
        <AuditLogsFilters />
      </Suspense>
      {error ? <ApiErrorBanner message={error} /> : null}
      {result.logs.length === 0 && !error ? (
        <EmptyState title="No audit logs" description="Matching audit events will appear here." />
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            Showing {result.logs.length} of {result.total} logs
          </p>
          <AuditLogsTable logs={result.logs} />
        </>
      )}
    </>
  );
}
