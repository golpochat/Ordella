import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@shared-ui';
import { ApiErrorBanner } from '@/components/ui/api-error-banner';
import { PageHeader } from '@/components/ui/page-header';
import { createServerApiClient } from '@/lib/api/server';
import { getAuditLog, type AuditLog } from '@/lib/api/admin/audit-logs';
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
    <div className="space-y-6">
      <PageHeader title="Audit Log Detail" description="Tamper-evident compliance record with request metadata." />
      <Link className="text-sm text-primary underline-offset-4 hover:underline" href="/audit-logs">Back to audit logs</Link>
      {error ? <ApiErrorBanner message={error} /> : null}
      {log ? (
        <Card>
          <CardHeader>
            <CardTitle>{log.action}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Timestamp" value={formatDate(log.createdAt)} />
              <Field label="Actor" value={`${log.actorType} · ${log.userId ?? 'system'}`} />
              <Field label="Entity" value={`${log.entityType} · ${log.entityId ?? 'none'}`} />
              <Field label="Status" value={log.status} />
              <Field label="Risk" value={log.riskLevel} />
              <Field label="Source" value={log.source} />
              <Field label="IP address" value={log.ipAddress ?? 'Unknown'} />
              <Field label="Location" value={log.locationId ?? 'All'} />
              <Field label="Retention" value={log.retentionUntil ? formatDate(log.retentionUntil) : 'Default policy'} />
            </div>
            <div>
              <p className="font-medium">Tamper evidence</p>
              <p className="break-all text-muted-foreground">Hash: {log.hash ?? 'Pending'}</p>
              <p className="break-all text-muted-foreground">Previous hash: {log.previousHash ?? 'None'}</p>
            </div>
            <pre className="max-h-[32rem] overflow-auto rounded-md border bg-muted/40 p-3 text-xs">{JSON.stringify(log.metadata, null, 2)}</pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-all font-medium">{value}</p>
    </div>
  );
}
