import { Suspense } from 'react';
import { createServerApiClient } from '@/lib/api/server';
import { listAuditLogs } from '@/lib/api/admin/audit-logs';
import { PageHeader } from '@shared-ui';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { AuditLogsFilters } from '@/components/audit-logs/audit-logs-filters';
import { AuditLogsTable } from '@/components/audit-logs/audit-logs-table';
import { AuditLogsActions } from '@/components/audit-logs/audit-logs-actions';
import { AuditLogsPagination } from '@/components/audit-logs/audit-logs-pagination';
import { getErrorMessage } from '@/lib/utils';

type AuditLogsPageProps = {
  searchParams: {
    from?: string;
    to?: string;
    userId?: string;
    locationId?: string;
    entityType?: string;
    action?: string;
    actorType?: string;
    source?: string;
    status?: string;
    riskLevel?: string;
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
      <Suspense fallback={null}>
        <AuditLogsActions />
      </Suspense>
      {error ? <ApiErrorBanner message={error} /> : null}
      {!error ? (
        <>
          <AuditLogsTable logs={result.logs} />
          {result.total > 0 ? (
            <AuditLogsPagination
              page={result.page}
              limit={result.limit}
              total={result.total}
              searchParams={searchParams}
            />
          ) : null}
        </>
      ) : null}
    </>
  );
}
