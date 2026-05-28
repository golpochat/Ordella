import { createServerApiClient } from '@/lib/api/server';
import { getAuditLog, type AuditLog } from '@/lib/api/admin/audit-logs';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import {
  DetailField,
  DetailPage,
  DetailPageHeader,
  DetailSectionCard,
  DetailStatusBadge,
  Grid,
  Stack,
} from '@/components/ui/admin-detail';
import { formatDate, getErrorMessage } from '@/lib/utils';

export default async function AuditLogDetailPage({ params }: { params: { id: string } }) {
  let log: AuditLog | null = null;
  let error: string | null = null;

  try {
    log = await getAuditLog(createServerApiClient(), params.id);
  } catch (err) {
    error = getErrorMessage(err);
  }

  return (
    <DetailPage>
      <DetailPageHeader
        breadcrumb={[
          { label: 'Audit logs', href: '/audit-logs' },
          { label: 'Detail' },
        ]}
        title="Audit log detail"
        description="Tamper-evident compliance record with request metadata."
      />
      {error ? <ApiErrorBanner message={error} /> : null}
      {log ? (
        <>
          <DetailSectionCard title={log.action} description={`Recorded ${formatDate(log.createdAt)}`}>
            <Grid cols={1} gap="md" className="min-[481px]:grid-cols-2 min-[769px]:grid-cols-3">
              <DetailField label="Timestamp" value={formatDate(log.createdAt)} />
              <DetailField label="Actor" value={`${log.actorType} · ${log.userId ?? 'system'}`} />
              <DetailField label="Entity" value={`${log.entityType} · ${log.entityId ?? 'none'}`} />
              <DetailField label="Status" value={<DetailStatusBadge status={log.status} />} />
              <DetailField label="Risk" value={<DetailStatusBadge status={log.riskLevel} />} />
              <DetailField label="Source" value={log.source} />
              <DetailField label="IP address" value={log.ipAddress ?? 'Unknown'} />
              <DetailField label="Location" value={log.locationId ?? 'All'} />
              <DetailField
                label="Retention"
                value={log.retentionUntil ? formatDate(log.retentionUntil) : 'Default policy'}
              />
            </Grid>
          </DetailSectionCard>

          <DetailSectionCard title="Tamper evidence">
            <Stack gap="sm">
              <p className="text-xs text-muted-foreground">Hash</p>
              <p className="break-all font-mono text-sm text-foreground">{log.hash ?? 'Pending'}</p>
              <p className="text-xs text-muted-foreground">Previous hash</p>
              <p className="break-all font-mono text-sm text-foreground">{log.previousHash ?? 'None'}</p>
            </Stack>
          </DetailSectionCard>

          <DetailSectionCard title="Metadata">
            <pre className="max-h-[32rem] overflow-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-xs text-foreground">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </DetailSectionCard>
        </>
      ) : null}
    </DetailPage>
  );
}
